
import { UsersRound, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GroupMember } from "@/types";

interface BalanceData {
  userId: string;
  displayName: string;
  balance: number;
}

interface GroupBalanceSummaryProps {
  expenses: {
    amount: number;
    paid_by_user_id: string;
    expense_participants: {
      user_id: string;
      share_amount: number | null;
      share_percentage: number | null;
    }[];
  }[];
  members: GroupMember[];
  currency: string;
}

export function GroupBalanceSummary({ expenses, members, currency }: GroupBalanceSummaryProps) {
  const calculateBalances = (): BalanceData[] => {
    const balances = new Map<string, number>();
    
    // Initialize balances for all members
    members.forEach(member => {
      balances.set(member.user_id, 0);
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      // Add the full amount to payer's balance
      balances.set(
        expense.paid_by_user_id, 
        (balances.get(expense.paid_by_user_id) || 0) + expense.amount
      );

      // Subtract each participant's share
      expense.expense_participants.forEach(participant => {
        const share = participant.share_amount || 
          (participant.share_percentage ? (expense.amount * participant.share_percentage / 100) : 
          (expense.amount / expense.expense_participants.length));

        balances.set(
          participant.user_id,
          (balances.get(participant.user_id) || 0) - share
        );
      });
    });

    // Convert to array and add display names
    return Array.from(balances.entries()).map(([userId, balance]) => ({
      userId,
      displayName: members.find(m => m.user_id === userId)?.profiles.display_name || 'Unknown',
      balance: Number(balance.toFixed(2))
    }));
  };

  const balances = calculateBalances();
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency
  });

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <UsersRound className="h-5 w-5 text-neutral-500" />
        <h2 className="font-semibold">Balance Summary</h2>
      </div>
      
      <div className="space-y-2">
        {balances.map(({ userId, displayName, balance }) => (
          <div key={userId} className="flex items-center justify-between">
            <span className="text-sm">{displayName}</span>
            <div className={`flex items-center gap-1 ${
              balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-neutral-500'
            }`}>
              {balance > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : balance < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              <span className="font-medium">
                {formatter.format(Math.abs(balance))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
