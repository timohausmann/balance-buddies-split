
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditGroupForm } from "@/components/EditGroupForm";
import { Group } from "@/types";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [inviteLink, setInviteLink] = useState<string>("");
  const { toast } = useToast();

  const createInvitation = async () => {
    if (!group) return;

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          group_id: group.id,
          group_name: group.title,
          expires_at: expiryDate.toISOString(),
        })
        .select('token')
        .single();

      if (error) throw error;

      const newInviteLink = `${window.location.origin}/invite/${invitation.token}`;
      setInviteLink(newInviteLink);
      return newInviteLink;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invitation link. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleShareOpen = async (open: boolean) => {
    if (open) {
      const link = await createInvitation();
      if (link) {
        setIsShareOpen(true);
      }
    } else {
      setIsShareOpen(false);
      setInviteLink("");
    }
  };

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

      <Dialog open={isShareOpen} onOpenChange={handleShareOpen}>
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
                value={inviteLink}
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={() => inviteLink && onCopyInviteLink()}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-neutral-400">
              This invitation link will expire in 7 days.
            </p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          {group && (
            <ExpenseForm
              groupId={group.id}
              onSuccess={onExpenseSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
