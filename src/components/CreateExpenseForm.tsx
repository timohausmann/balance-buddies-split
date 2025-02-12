
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseSelect } from "./ui/base-select";
import { TitleAmountSection } from "./expense/TitleAmountSection";
import { ParticipantsSection } from "./expense/ParticipantsSection";
import { FormValues, GroupMember } from "./expense/types";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateExpenseFormProps {
  groupId?: string;
  groupMembers: GroupMember[];
  defaultCurrency: string;
  onSuccess: () => void;
}

export function CreateExpenseForm({ 
  groupId, 
  groupMembers, 
  defaultCurrency, 
  onSuccess 
}: CreateExpenseFormProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const { data: userGroups } = useQuery({
    queryKey: ['user-groups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          default_currency,
          group_members!inner(
            user_id,
            profiles(
              id,
              display_name
            )
          )
        `)
        .eq('group_members.user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: true
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      currency: defaultCurrency,
      spreadType: 'equal',
      paidByUserId: groupMembers[0]?.user_id || '',
      participantIds: groupMembers.map(member => member.user_id),
      groupId: groupId || '',
      expenseDate: new Date().toISOString().slice(0, 16)
    }
  });

  const selectedGroupId = watch("groupId");
  const selectedGroup = userGroups?.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (selectedGroup) {
      setValue("currency", selectedGroup.default_currency);
    }
  }, [selectedGroup, setValue]);

  const spreadTypeOptions = [
    { value: 'equal', label: 'Equal split' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'amount', label: 'Fixed amount' }
  ];

  const paidByOptions = (selectedGroup?.group_members || []).map(member => ({
    value: member.user_id,
    label: member.profiles?.display_name || 'Unknown'
  }));

  const groupOptions = userGroups?.map(group => ({
    value: group.id,
    label: group.title
  })) || [];

  const onSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          title: data.title,
          amount: parseFloat(data.amount),
          currency: data.currency,
          spread_type: data.spreadType,
          description: data.description,
          paid_by_user_id: data.paidByUserId,
          group_id: data.groupId,
          expense_date: new Date(data.expenseDate).toISOString(),
          created_by_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      const { error: participantsError } = await supabase
        .from('expense_participants')
        .insert(
          data.participantIds.map(userId => ({
            expense_id: expense.id,
            user_id: userId,
            share_percentage: data.spreadType === 'equal' 
              ? 100 / data.participantIds.length 
              : null
          }))
        );

      if (participantsError) throw participantsError;

      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });

      toast({
        title: "Expense created",
        description: "Your expense has been recorded successfully."
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <BaseSelect
          label="Group"
          required
          value={watch("groupId")}
          onValueChange={(value) => setValue("groupId", value)}
          options={groupOptions}
          disabled={!!groupId}
        />

        <TitleAmountSection
          register={register}
          errors={errors}
          defaultCurrency={selectedGroup?.default_currency || defaultCurrency}
          watch={watch}
          setValue={setValue}
        />

        <div>
          <Label htmlFor="expenseDate">
            Date & Time <span className="text-red-500">*</span>
          </Label>
          <Input
            type="datetime-local"
            id="expenseDate"
            {...register("expenseDate", { required: "Date is required" })}
          />
          {errors.expenseDate && (
            <p className="text-sm text-red-500 mt-1">{errors.expenseDate.message as string}</p>
          )}
        </div>

        <BaseSelect
          label="Paid by"
          required
          value={watch("paidByUserId")}
          onValueChange={(value) => setValue("paidByUserId", value)}
          options={paidByOptions}
        />

        <ParticipantsSection
          groupMembers={selectedGroup?.group_members || groupMembers}
          watch={watch}
          setValue={setValue}
        />

        <BaseSelect
          label="Split type"
          required
          value={watch("spreadType")}
          onValueChange={(value) => setValue("spreadType", value)}
          options={spreadTypeOptions}
        />

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Add any additional details..."
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Expense"}
      </Button>
    </form>
  );
}
