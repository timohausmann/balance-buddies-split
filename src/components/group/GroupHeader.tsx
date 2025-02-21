
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Trash2, Settings, Users } from "lucide-react";
import { GroupMemberChips } from "@/components/group/GroupMemberChips";
import { useToast } from "@/hooks/use-toast";
import { GroupInviteManager } from "./GroupInviteManager";

interface GroupHeaderProps {
  group: {
    id: string;
    title: string;
    description?: string | null;
    default_currency: string;
    group_members: {
      user_id: string;
      profiles: {
        id: string;
        display_name: string;
      };
    }[];
  };
  expenses?: {
    amount: number;
    paid_by_user_id: string;
    expense_participants: {
      user_id: string;
      share_amount: number | null;
      share_percentage: number | null;
    }[];
  }[];
  isAdmin?: boolean;
  onEditClick?: () => void;
  onShareClick?: () => void;
  onDeleteClick?: () => void;
}

export function GroupHeader({ 
  group,
  expenses = [],
  isAdmin,
  onEditClick,  
  onShareClick,
  onDeleteClick
}: GroupHeaderProps) {
  const { toast } = useToast();

  return (
    <div className="mb-8 space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.title}</h1>
          {group.description && (
            <p className="text 2-neutral-500 line-clamp-2">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={onEditClick}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={onDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-neutral-500" />
              <span className="text-sm text-neutral-500">
                {group.group_members.length} member{group.group_members.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <GroupInviteManager groupId={group.id} groupTitle={group.title} />
            </div>
          </div>
          <GroupMemberChips 
            members={group.group_members} 
            expenses={expenses}
            currency={group.default_currency}
          />
        </div>
      </Card>
    </div>
  );
}
