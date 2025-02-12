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
import { currencies } from "@/lib/currencies";

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

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        displayName: profile?.display_name || 'Me'
      };
    }
  });

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

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('currencies')
        .select('*');

      return data;
    },
    enabled: true
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      currency: defaultCurrency,
      spreadType: 'equal',
      paidByUserId: '',
      participantIds: [],  // Start with empty array, we'll populate it when we have currentUser
      groupId: groupId || '',
      expenseDate: new Date().toISOString().slice(0, 16)
    }
  });

  useEffect(() => {
    if (currentUser?.id) {
      setValue('paidByUserId', currentUser.id);
      // If no participants are set yet, add the current user
      const currentParticipants = watch("participantIds");
      if (currentParticipants.length === 0) {
        setValue('participantIds', [currentUser.id]);
      }
    }
  }, [currentUser, setValue, watch]);

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

  const paidByOptions = currentUser ? [
    { value: currentUser.id, label: `Me (${currentUser.displayName})` },
    ...(selectedGroup?.group_members || [])
      .filter(member => member.user_id !== currentUser.id)
      .map(member => ({
        value: member.user_id,
        label: member.profiles?.display_name || 'Unknown'
      }))
  ] : [];

  const groupOptions = userGroups?.map(group => ({
    value: group.id,
    label: group.title
  })) || [];

  const currencyOptions = [
    ...currencies.map((curr) => ({
      value: curr.code,
      label: `${curr.code} (${curr.symbol}) - ${curr.name}`,
    })),
    { value: "other", label: "Other" }
  ];

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
          created_by_user_id: currentUser?.id
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Dinner at Restaurant"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message as string}</p>
            )}
          </div>

          <BaseSelect
            label="Group"
            required
            value={watch("groupId")}
            onValueChange={(value) => setValue("groupId", value)}
            options={groupOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { 
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" }
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message as string}</p>
            )}
          </div>

          <BaseSelect
            label="Currency"
            required
            value={watch("currency")}
            onValueChange={(value) => setValue("currency", value)}
            options={currencyOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <BaseSelect
            label="Paid by"
            required
            value={watch("paidByUserId")}
            onValueChange={(value) => setValue("paidByUserId", value)}
            options={paidByOptions}
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
        </div>

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
