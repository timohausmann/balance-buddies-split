
import { useState } from "react";
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

interface CreateExpenseFormProps {
  groupId: string;
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

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      currency: defaultCurrency,
      spreadType: 'equal',
      paidByUserId: groupMembers[0]?.user_id || '',
      participantIds: groupMembers.map(member => member.user_id)
    }
  });

  const spreadTypeOptions = [
    { value: 'equal', label: 'Equal split' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'amount', label: 'Fixed amount' }
  ];

  const paidByOptions = groupMembers.map(member => ({
    value: member.user_id,
    label: member.profiles?.display_name || 'Unknown'
  }));

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
          group_id: groupId,
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
        <TitleAmountSection
          register={register}
          errors={errors}
          defaultCurrency={defaultCurrency}
          watch={watch}
          setValue={setValue}
        />

        <BaseSelect
          label="Paid by"
          required
          value={watch("paidByUserId")}
          onValueChange={(value) => setValue("paidByUserId", value)}
          options={paidByOptions}
        />

        <ParticipantsSection
          groupMembers={groupMembers}
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
