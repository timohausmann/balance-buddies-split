
import { ExpenseCard } from "@/components/ExpenseCard";

interface GroupExpensesListProps {
  expenses: Array<{
    id: string;
    title: string;
    amount: number;
    currency: string;
    created_at: string;
    paid_by_profile: { display_name: string } | null;
    expense_participants: Array<{
      participant_profile: { display_name: string } | null
    }>;
  }>;
  onAddExpenseClick: () => void;
  isLoading?: boolean;
}

export const GroupExpensesList = ({ expenses, onAddExpenseClick, isLoading }: GroupExpensesListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <ExpenseCard
            key={i}
            id=""
            title=""
            amount={0}
            currency=""
            date={new Date()}
            paidBy=""
            participants={[]}
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <p className="text-center py-8 text-neutral-500">
          Add the first expense to get started
        </p>
      ) : (
        expenses.map((expense) => (
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
        ))
      )}
    </div>
  );
};
