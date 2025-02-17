
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExpenseFormState } from "./useExpenseFormState";
import { useExpenseSubmit } from "./useExpenseSubmit";
import { useGroupData } from "./useGroupData";
import { Expense } from "@/types";

interface UseExpenseFormProps {
  groupId?: string;
  onSuccess: () => void;
  expenseToEdit?: Expense;
}

export function useExpenseForm({
  groupId,
  onSuccess,
  expenseToEdit
}: UseExpenseFormProps) {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { groups, groupOptions } = useGroupData();

  const selectedGroup = groupId 
    ? groups?.find(g => g.id === groupId)
    : groups?.find(g => g.id === formState.watch('groupId'));

  const formState = useExpenseFormState({
    selectedGroup,
    expenseToEdit,
  });

  const { handleSubmit: submitHandler, isPending } = useExpenseSubmit({
    expenseToEdit,
    onSuccess,
    currentUserId: currentUser?.id
  });

  return {
    ...formState,
    isPending,
    selectedGroup,
    groupOptions,
    onSubmit: (e) => formState.handleSubmit(submitHandler)(e)
  };
}
