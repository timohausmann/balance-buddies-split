
import { useForm } from "react-hook-form";
import { FormValues } from "../types";
import { Expense } from "@/types";
interface UseExpenseFormStateProps {
  expenseToEdit?: Expense;
  groupId?: string;
}

export function useExpenseFormState({
  expenseToEdit,
  groupId,
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
