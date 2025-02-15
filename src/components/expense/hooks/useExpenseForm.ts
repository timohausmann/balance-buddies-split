
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExpenseFormState } from "./useExpenseFormState";
import { useExpenseSubmit } from "./useExpenseSubmit";
import { useGroupData } from "./useGroupData";

interface UseExpenseFormProps {
  groupId?: string;
  defaultCurrency: string;
  onSuccess: () => void;
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
}

export function useExpenseForm({
  groupId,
  defaultCurrency,
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
  
  const formState = useExpenseFormState({
    expenseToEdit,
    defaultCurrency,
    groupId
  });

  const { handleSubmit: submitHandler, isPending } = useExpenseSubmit({
    expenseToEdit,
    onSuccess,
    currentUserId: currentUser?.id
  });

  const selectedGroup = groupId 
    ? groups?.find(g => g.id === groupId)
    : groups?.find(g => g.id === formState.watch('groupId'));

  return {
    ...formState,
    isPending,
    selectedGroup,
    groupOptions,
    onSubmit: formState.handleSubmit(submitHandler)
  };
}
