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

      // Validate total shares
      const totalAmount = parseFloat(data.amount);
      const totalShared = data.participants.reduce((sum, p) => 
        sum + (data.spreadType === 'amount' ? p.share_amount : p.share_percentage), 0
      );

      const isValid = data.spreadType === 'amount' 
        ? Math.abs(totalShared - totalAmount) < 0.01
        : Math.abs(totalShared - 100) < 0.01;

      if (!isValid) {
        toast({
          title: "Invalid shares",
          description: data.spreadType === 'amount' 
            ? "The sum of all shares must equal the total amount"
            : "The sum of all shares must equal 100%",
          variant: "destructive"
        });
        return;
      }

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

    // Delete existing participants
    const { error: deleteError } = await supabase
      .from('expense_participants')
      .delete()
      .eq('expense_id', expenseToEdit!.id);

    if (deleteError) throw deleteError;

    // Insert new participants with their shares
    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(data.participants.map(p => ({
        expense_id: expenseToEdit!.id,
        user_id: p.user_id,
        share_percentage: p.share_percentage,
        share_amount: p.share_amount
      })));

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

    // Insert participants with their shares
    const { error: participantsError } = await supabase
      .from('expense_participants')
      .insert(data.participants.map(p => ({
        expense_id: expense.id,
        user_id: p.user_id,
        share_percentage: p.share_percentage,
        share_amount: p.share_amount
      })));

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
