
import { useState } from "react";
import { ExpenseCard } from "@/components/ExpenseCard";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { useToast } from "@/hooks/use-toast";

// Temporary mock data
const mockExpenses = [
  {
    id: 1,
    title: "Dinner at Italian Restaurant",
    amount: 120.50,
    date: new Date("2024-02-20"),
    paidBy: "Alice",
    participants: ["Alice", "Bob", "Charlie", "David"],
  },
  {
    id: 2,
    title: "Movie Night",
    amount: 60.00,
    date: new Date("2024-02-19"),
    paidBy: "Bob",
    participants: ["Alice", "Bob", "Charlie"],
  },
  {
    id: 3,
    title: "Groceries",
    amount: 85.75,
    date: new Date("2024-02-18"),
    paidBy: "Charlie",
    participants: ["Alice", "Charlie", "David"],
  },
];

const Index = () => {
  const { toast } = useToast();
  const [expenses] = useState(mockExpenses);

  const handleAddExpense = () => {
    toast({
      title: "Coming soon!",
      description: "Add expense functionality will be available soon.",
    });
  };

  const handleExpenseClick = (id: number) => {
    toast({
      title: "Coming soon!",
      description: "Expense details will be available soon.",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Expenses</h1>
          <p className="text-neutral-500">Track and split expenses with friends</p>
        </header>

        <div className="space-y-4">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              title={expense.title}
              amount={expense.amount}
              date={expense.date}
              paidBy={expense.paidBy}
              participants={expense.participants}
              onClick={() => handleExpenseClick(expense.id)}
            />
          ))}
        </div>

        <AddExpenseButton onClick={handleAddExpense} />
      </div>
    </div>
  );
};

export default Index;
