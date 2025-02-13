
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ExpenseCard } from "@/components/ExpenseCard";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GroupHeader } from "@/components/group/GroupHeader";
import { GroupDialogs } from "@/components/group/GroupDialogs";
import { GroupBalanceSummary } from "@/components/group/GroupBalanceSummary";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: group, refetch } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      if (!id) throw new Error('No group ID provided');
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
            is_admin,
            user_id,
            profiles (
              id,
              display_name
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      if (!id) throw new Error('No group ID provided');
      
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          paid_by_profile:profiles!expenses_paid_by_user_id_fkey1 (
            display_name
          ),
          expense_participants (
            user_id,
            share_amount,
            share_percentage,
            participant_profile:profiles!expense_participants_user_id_fkey1 (
              display_name
            )
          )
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const isAdmin = group?.group_members?.some(
    member => member.user_id === currentUser?.id && member.is_admin
  );

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Group deleted",
        description: "The group has been deleted successfully."
      });

      navigate('/groups');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    refetch();
  };

  const handleExpenseSuccess = () => {
    setIsExpenseFormOpen(false);
    refetch();
  };

  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/invite/${id}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link copied!",
        description: "The invite link has been copied to your clipboard."
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {group && (
          <GroupHeader
            group={group}
            isAdmin={isAdmin}
            onEditClick={() => setIsEditOpen(true)}
            onShareClick={() => setIsShareOpen(true)}
            onDeleteClick={() => setIsDeleteDialogOpen(true)}
          />
        )}

        {group && expenses && (
          <GroupBalanceSummary
            expenses={expenses}
            members={group.group_members}
            currency={group.default_currency}
          />
        )}

        <GroupDialogs
          group={group}
          isEditOpen={isEditOpen}
          setIsEditOpen={setIsEditOpen}
          isShareOpen={isShareOpen}
          setIsShareOpen={setIsShareOpen}
          isExpenseFormOpen={isExpenseFormOpen}
          setIsExpenseFormOpen={setIsExpenseFormOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          onEditSuccess={handleEditSuccess}
          onExpenseSuccess={handleExpenseSuccess}
          onDeleteConfirm={handleDelete}
          onCopyInviteLink={copyInviteLink}
        />

        <div className="space-y-4">
          {expenses?.length === 0 ? (
            <p className="text-center py-8 text-neutral-500">
              Add the first expense to get started
            </p>
          ) : (
            expenses?.map((expense) => (
              <ExpenseCard
                key={expense.id}
                id={expense.id}
                title={expense.title}
                amount={expense.amount}
                currency={expense.currency}
                date={new Date(expense.created_at)}
                paidBy={expense.paid_by_profile?.display_name || 'Unknown'}
                participants={expense.expense_participants.map(p => p.participant_profile?.display_name || 'Unknown')}
              />
            ))
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsExpenseFormOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-dark transition-colors duration-200"
              >
                <Plus className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-white px-3 py-1.5 text-sm shadow-md rounded-md border">
              Add expense
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </MainLayout>
  );
};

export default GroupDetail;
