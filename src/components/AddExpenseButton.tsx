
import { Plus } from "lucide-react";

interface AddExpenseButtonProps {
  onClick: () => void;
}

export const AddExpenseButton = ({ onClick }: AddExpenseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-dark transition-colors duration-200"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};
