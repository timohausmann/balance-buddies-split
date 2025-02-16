
import { useForm } from "react-hook-form";
import { FormValues } from "../types";

interface UseExpenseFormStateProps {
  expenseToEdit?: {
    id: string;
    title: string;
    amount: number;
    currency: string;
    spread_type: string;
    description?: string;
    paid_by_user_id: string;
    group_id: string;
    expense_date: string;
    expense_participants: Array<{
      user_id: string;
      share_percentage?: number;
      share_amount?: number;
    }>;
  };
  defaultCurrency: string;
  groupId?: string;
}

export function useExpenseFormState({
  expenseToEdit,
  defaultCurrency,
  groupId,
}: UseExpenseFormStateProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      title: expenseToEdit?.title || '',
      amount: expenseToEdit?.amount.toString() || '',
      currency: expenseToEdit?.currency || defaultCurrency,
      spreadType: expenseToEdit?.spread_type || 'equal',
      description: expenseToEdit?.description || '',
      paidByUserId: expenseToEdit?.paid_by_user_id || '',
      participantIds: expenseToEdit?.expense_participants.map(p => p.user_id) || [],
      participantShares: expenseToEdit?.expense_participants.reduce((acc: Record<string, number>, p) => {
        if (expenseToEdit.spread_type === 'percentage' && p.share_percentage !== undefined) {
          acc[p.user_id] = p.share_percentage;
        } else if (expenseToEdit.spread_type === 'amount' && p.share_amount !== undefined) {
          acc[p.user_id] = p.share_amount;
        }
        return acc;
      }, {}) || {},
      groupId: expenseToEdit?.group_id || groupId || '',
      expenseDate: expenseToEdit?.expense_date 
        ? new Date(expenseToEdit.expense_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    }
  });

  return {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    reset
  };
}
