import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditGroupForm } from "@/components/EditGroupForm";
import { Group } from "@/types";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}: GroupDialogsProps) => {

  const [inviteLink, setInviteLink] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (isShareOpen && !inviteLink) {
      createInvitation();
    }
  }, [isShareOpen]);

  const createInvitation = async () => {
    if (!group) return null;

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 2);

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
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create invitation link. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Success",
        description: "Invite link copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
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

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Share this link with friends to invite them to this group. <br />
              Link expires in 2 days.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                placeholder="generating link..."
                value={inviteLink}
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
