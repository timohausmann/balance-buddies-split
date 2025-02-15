
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormValues } from "../types";
import { SubmitHandler } from "react-hook-form";

interface UseExpenseSubmitProps {
  expenseToEdit?: {
    id: string;
  };
  onSuccess: () => void;
  currentUserId?: string;
}

export function useExpenseSubmit({
  expenseToEdit,
  onSuccess,
  currentUserId
}: UseExpenseSubmitProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsPending(true);

      if (expenseToEdit) {
        await handleUpdate(data);
      } else {
        await handleCreate(data);
      }

      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
      if (expenseToEdit) {
        await queryClient.invalidateQueries({ queryKey: ['expense', expenseToEdit.id] });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${expenseToEdit ? 'update' : 'create'} expense. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdate = async (data: FormValues) => {
    const { error: expenseError } = await supabase
      .from('expenses')
      .update({
        title: data.title,
        amount: parseFloat(data.amount),
        currency: data.currency,
        spread_type: data.spreadType,
        description: data.description,
        paid_by_user_id: data.paidByUserId,
        group_id: data.groupId,
        expense_date: new Date(data.expenseDate).toISOString(),
      })
      .eq('id', expenseToEdit!.id);

    if (expenseError) throw expenseError;

    const { error: deleteError } = await supabase
      .from('expense_participants')
      .delete()
      .eq('expense_id', expenseToEdit!.id);

    if (deleteError) throw deleteError;

    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(
        data.participantIds.map(userId => ({
          expense_id: expenseToEdit!.id,
          user_id: userId,
          share_percentage: data.participantShares[userId] || (100 / data.participantIds.length)
        }))
      );

    if (participantsError) throw participantsError;

    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully."
    });
  };

  const handleCreate = async (data: FormValues) => {
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
        created_by_user_id: currentUserId
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
          share_percentage: data.participantShares[userId] || (100 / data.participantIds.length)
        }))
      );

    if (participantsError) throw participantsError;

    toast({
      title: "Expense created",
      description: "Your expense has been recorded successfully."
    });
  };

  return {
    handleSubmit,
    isPending
  };
}
