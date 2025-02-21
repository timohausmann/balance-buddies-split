
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GroupHeader } from "@/components/group/GroupHeader";
import { GroupDialogs } from "@/components/group/GroupDialogs";
import { GroupExpensesList } from "@/components/group/GroupExpensesList";
import { AddExpenseButton } from "@/components/group/AddExpenseButton";
import { Skeleton } from "@/components/ui/skeleton";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: group, isLoading: isGroupLoading, refetch: refetchGroup } = useQuery({
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

  const { data: expenses, isLoading: isExpensesLoading, refetch: refetchExpenses } = useQuery({
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
    refetchGroup();
  };

  const handleExpenseSuccess = () => {
    setIsExpenseFormOpen(false);
    refetchExpenses();
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
        {(isGroupLoading || isExpensesLoading) ? (
          <>
            <header className="mb-8">
              <Skeleton className="h-9 w-64 mb-2 bg-neutral-100" />
              <Skeleton className="h-20 w-full bg-neutral-100" />
            </header>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-neutral-100" />
              ))}
            </div>
          </>
        ) : (
          group && (
            <>
              <GroupHeader
                group={group}
                expenses={expenses}
                isAdmin={isAdmin}
                onEditClick={() => setIsEditOpen(true)}
                onShareClick={() => setIsShareOpen(true)}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
              />

              {group && expenses && (
                <GroupExpensesList 
                  expenses={expenses} 
                  onAddExpenseClick={() => setIsExpenseFormOpen(true)}
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
              />

              <AddExpenseButton onClick={() => setIsExpenseFormOpen(true)} />
            </>
          )
        )}
      </div>
    </MainLayout>
  );
};

export default GroupDetail;
