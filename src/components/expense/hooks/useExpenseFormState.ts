import { useForm } from "react-hook-form";
import { FormValues } from "../types";
import { Expense } from "@/types";
import { useEffect } from "react";

interface UseExpenseFormStateProps {
  expenseToEdit?: Expense;
  selectedGroup?: {
    id: string;
    default_currency: string;
    group_members: Array<{
      user_id: string;
      profiles: {
        id: string;
        display_name: string;
      } | null;
    }>;
  } | null;
}

export function useExpenseFormState({
  expenseToEdit,
  selectedGroup,
}: UseExpenseFormStateProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      title: expenseToEdit?.title || '',
      amount: expenseToEdit?.amount.toString() || '',
      currency: expenseToEdit?.currency || '',
      spreadType: expenseToEdit?.spread_type || 'equal',
      description: expenseToEdit?.description || '',
      paidByUserId: expenseToEdit?.paid_by_user_id || '',
      participants: expenseToEdit?.expense_participants || [],
      groupId: expenseToEdit?.group_id || '',
      expenseDate: expenseToEdit?.expense_date 
        ? new Date(expenseToEdit.expense_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    }
  });

  // Update form when selectedGroup becomes available
  useEffect(() => {
    if (selectedGroup && !expenseToEdit) {
      const currentValues = watch();
      reset({
        ...currentValues,
        currency: selectedGroup.default_currency,
        groupId: selectedGroup.id,
        participants: selectedGroup.group_members.map(member => ({
          user_id: member.user_id,
          share_percentage: 100 / (selectedGroup.group_members.length || 1),
          share_amount: 0
        }))
      });
    }
  }, [selectedGroup, expenseToEdit, reset]);

  return {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    reset
  };
}
