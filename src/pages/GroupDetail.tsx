import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Edit, UserPlus, Plus, User, Trash2 } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditGroupForm } from "@/components/EditGroupForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExpenseCard } from "@/components/ExpenseCard";
import { CreateExpenseForm } from "@/components/CreateExpenseForm";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
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
        <header className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{group?.title}</h1>
            
            {group?.description && (
              <Collapsible
                open={isDescriptionExpanded}
                onOpenChange={setIsDescriptionExpanded}
                className="relative"
              >
                <CollapsibleTrigger className="w-full text-left">
                  <p className={`text-neutral-500 ${!isDescriptionExpanded ? 'line-clamp-2' : ''} ${!isDescriptionExpanded ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:bg-gradient-to-t after:from-neutral-50 after:to-transparent' : ''}`}>
                    {group.description}
                  </p>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-neutral-500">{group.description}</p>
                </CollapsibleContent>
              </Collapsible>
            )}

            <button
              onClick={() => setIsMembersOpen(true)}
              className="flex items-center gap-2 mt-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>{group?.group_members?.length || 0} members</span>
            </button>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsShareOpen(true)}
                className="rounded-full"
              >
                <UserPlus className="h-4 w-4" />
                <span className="ml-2 sm:inline hidden">Invite</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditOpen(true)}
                className="rounded-full"
              >
                <Edit className="h-4 w-4" />
                <span className="ml-2 sm:inline hidden">Edit</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="rounded-full"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-2 sm:inline hidden">Delete</span>
              </Button>
            </div>
          )}
        </header>

        <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {group?.group_members?.map((member) => (
                <Link
                  key={member.profiles?.id}
                  to={`/profile/${member.profiles?.id}`}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-neutral-500" />
                    </div>
                    <span className="font-medium">{member.profiles?.display_name}</span>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {member.is_admin ? 'Admin' : 'Member'}
                  </span>
                </Link>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            {group && (
              <EditGroupForm
                group={group}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                Share this link with friends to invite them to join the group:
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/invite/${id}`}
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button onClick={copyInviteLink}>
                  Copy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the group
                and all associated expenses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            {group && (
              <CreateExpenseForm
                groupId={group.id}
                groupMembers={group.group_members}
                defaultCurrency={group.default_currency}
                onSuccess={handleExpenseSuccess}
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {expenses?.map((expense) => (
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
          ))}
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
