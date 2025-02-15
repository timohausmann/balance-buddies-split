
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreateExpenseForm } from "@/components/CreateExpenseForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Edit, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { getCurrencySymbol } from "@/lib/currencies";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: expense } = useQuery({
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

      // Navigate back to the group page
      navigate(`/groups/${expense?.group_id}`);
      
      // Invalidate relevant queries
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

  if (!expense) return null;

  const isCreator = currentUser?.id === expense.created_by_user_id;
  const currencySymbol = getCurrencySymbol(expense.currency);

  // Calculate share amounts based on spread type and percentages
  const calculateShareAmount = (participant: any) => {
    if (expense.spread_type === 'equal') {
      return expense.amount / expense.expense_participants.length;
    } else if (participant.share_percentage) {
      return (expense.amount * participant.share_percentage) / 100;
    }
    return participant.share_amount || 0;
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            to={`/groups/${expense.group_id}`}
            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {expense.groups?.title}
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{expense.title}</h1>
              <p className="text-sm text-neutral-500">
                Added by {expense.created_by_profile?.display_name} on{" "}
                {format(new Date(expense.created_at), "PPP")}
              </p>
            </div>

            {isCreator && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="ml-2 sm:inline hidden">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-2 sm:inline hidden">Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-500 mb-1">Amount</p>
              <p className="text-xl font-semibold">
                {currencySymbol} {expense.amount.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-500 mb-1">Paid by</p>
              <p className="text-xl font-semibold">
                {expense.paid_by_profile?.display_name}
              </p>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500 mb-1">Split type</p>
            <p className="font-medium capitalize">
              {expense.spread_type}
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-500 mb-2">Participants</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expense.expense_participants.map((participant) => {
                  const shareAmount = calculateShareAmount(participant);
                  return (
                    <TableRow key={participant.user_id}>
                      <TableCell>{participant.participant_profile?.display_name}</TableCell>
                      <TableCell className="text-right">
                        {participant.share_percentage !== null 
                          ? `${participant.share_percentage}%`
                          : expense.spread_type === 'equal' 
                            ? `${(100 / expense.expense_participants.length).toFixed(1)}%`
                            : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {currencySymbol} {shareAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {expense.description && (
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-500 mb-2">Description</p>
              <p className="whitespace-pre-wrap">{expense.description}</p>
            </div>
          )}
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <CreateExpenseForm
              groupId={expense.group_id}
              groupMembers={expense.groups?.group_members || []}
              defaultCurrency={expense.groups?.default_currency || 'EUR'}
              onSuccess={handleEditSuccess}
              expenseToEdit={expense}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the expense
                and remove it from all calculations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default ExpenseDetail;
