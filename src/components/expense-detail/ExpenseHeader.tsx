
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ExpenseHeaderProps {
  expense: {
    title: string;
    created_at: string;
    group_id: string;
    groups?: {
      title: string;
    };
    created_by_profile?: {
      display_name: string;
    };
  };
  isCreator: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const ExpenseHeader = ({ 
  expense, 
  isCreator, 
  onEditClick, 
  onDeleteClick 
}: ExpenseHeaderProps) => {
  return (
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
              onClick={onEditClick}
            >
              <Edit className="h-4 w-4" />
              <span className="ml-2 sm:inline hidden">Edit</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-2 sm:inline hidden">Delete</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
