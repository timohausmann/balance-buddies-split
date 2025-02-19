
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExpenseForm } from "@/components/ExpenseForm";

interface ExpenseDialogsProps {
  expense: any;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onEditSuccess: () => void;
  onDeleteConfirm: () => void;
}

export const ExpenseDialogs = ({
  expense,
  isEditOpen,
  setIsEditOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onEditSuccess,
  onDeleteConfirm,
}: ExpenseDialogsProps) => {
  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            groupId={expense.group_id}
            expenseToEdit={expense}
            onSuccess={onEditSuccess}
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
            <AlertDialogAction onClick={onDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
