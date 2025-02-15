import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditGroupForm } from "@/components/EditGroupForm";
import { CreateExpenseForm } from "@/components/CreateExpenseForm";
import { Group } from "@/types";

interface GroupDialogsProps {
  group: Group | undefined;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  isShareOpen: boolean;
  setIsShareOpen: (open: boolean) => void;
  isExpenseFormOpen: boolean;
  setIsExpenseFormOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onEditSuccess: () => void;
  onExpenseSuccess: () => void;
  onDeleteConfirm: () => void;
  onCopyInviteLink: () => void;
}

export const GroupDialogs = ({
  group,
  isEditOpen,
  setIsEditOpen,
  isShareOpen,
  setIsShareOpen,
  isExpenseFormOpen,
  setIsExpenseFormOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onEditSuccess,
  onExpenseSuccess,
  onDeleteConfirm,
  onCopyInviteLink,
}: GroupDialogsProps) => {
  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          {group && (
            <EditGroupForm
              group={group}
              onSuccess={onEditSuccess}
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
                value={`${window.location.origin}/invite/${group?.id}`}
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={onCopyInviteLink}>
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
            <AlertDialogAction onClick={onDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          {group && (
            <CreateExpenseForm
              groupId={group.id}
              groupMembers={group.group_members}
              defaultCurrency={group.default_currency}
              onSuccess={onExpenseSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
