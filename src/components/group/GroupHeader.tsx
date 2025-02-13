
import { Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupMemberChips } from "./GroupMemberChips";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Group } from "@/types";

interface GroupHeaderProps {
  group: Group;
  expenses?: Array<{
    amount: number;
    paid_by_user_id: string;
    expense_participants: Array<{
      user_id: string;
      share_amount: number | null;
      share_percentage: number | null;
    }>;
  }>;
  isAdmin: boolean;
  onEditClick: () => void;
  onShareClick: () => void;
  onDeleteClick: () => void;
}

export const GroupHeader = ({
  group,
  expenses = [],
  isAdmin,
  onEditClick,
  onShareClick,
  onDeleteClick,
}: GroupHeaderProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <header className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">{group.title}</h1>
          
          {group.description && (
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
        </div>

        {isAdmin && (
          <div className="flex gap-2 ml-4">
            <Button 
              variant="outline" 
              onClick={onShareClick}
              className="rounded-full"
            >
              <UserPlus className="h-4 w-4" />
              <span className="ml-2 sm:inline hidden">Invite</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={onEditClick}
              className="rounded-full"
            >
              <Edit className="h-4 w-4" />
              <span className="ml-2 sm:inline hidden">Edit</span>
            </Button>
            <Button 
              variant="outline"
              onClick={onDeleteClick}
              className="rounded-full"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 sm:inline hidden">Delete</span>
            </Button>
          </div>
        )}
      </div>

      <GroupMemberChips 
        members={group.group_members} 
        expenses={expenses}
        currency={group.default_currency}
      />
    </header>
  );
};
