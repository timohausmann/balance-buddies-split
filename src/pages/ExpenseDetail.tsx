
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseHeader } from "@/components/expense-detail/ExpenseHeader";
import { ExpenseDetailsCard } from "@/components/expense-detail/ExpenseDetailsCard";
import { ExpenseParticipantsTable } from "@/components/expense-detail/ExpenseParticipantsTable";
import { ExpenseDialogs } from "@/components/expense-detail/ExpenseDialogs";

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: expense, isLoading: isExpenseLoading } = useQuery({
    queryKey: ['expense', id],
    queryFn: async () => {
      if (!id) throw new Error('No expense ID provided');
      
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          groups (
            title,
            default_currency,
            group_members (
              user_id,
              profiles (
                id,
                display_name
              )
            )
          ),
          paid_by_profile:profiles!expenses_paid_by_user_id_fkey1 (
            display_name
          ),
          created_by_profile:profiles!expenses_created_by_user_id_fkey1 (
            display_name
          ),
          expense_participants (
            user_id,
            share_percentage,
            share_amount,
            participant_profile:profiles!expense_participants_user_id_fkey1 (
              display_name
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Expense deleted",
        description: "The expense has been deleted successfully."
      });

      navigate(`/groups/${expense?.group_id}`);
      
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['expense', id] });
  };

  if (!expense && !isExpenseLoading) return null;

  const isCreator = currentUser?.id === expense?.created_by_user_id;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {isExpenseLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-9 w-48 bg-neutral-100" />
            <Skeleton className="h-32 w-full bg-neutral-100" />
            <Skeleton className="h-48 w-full bg-neutral-100" />
          </div>
        ) : expense && (
          <div>
            <ExpenseHeader
              expense={expense}
              isCreator={isCreator}
              onEditClick={() => setIsEditOpen(true)}
              onDeleteClick={() => setIsDeleteDialogOpen(true)}
            />

            <ExpenseDetailsCard
              amount={expense.amount}
              currency={expense.currency}
              paidByName={expense.paid_by_profile?.display_name}
              spreadType={expense.spread_type}
              description={expense.description}
            />

            <ExpenseParticipantsTable
              participants={expense.expense_participants}
              spreadType={expense.spread_type}
              amount={expense.amount}
              currency={expense.currency}
            />

            <ExpenseDialogs
              expense={expense}
              isEditOpen={isEditOpen}
              setIsEditOpen={setIsEditOpen}
              isDeleteDialogOpen={isDeleteDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              onEditSuccess={handleEditSuccess}
              onDeleteConfirm={handleDelete}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExpenseDetail;
