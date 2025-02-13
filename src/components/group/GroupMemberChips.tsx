
import { User, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GroupMember } from "@/types";

interface GroupMemberChipsProps {
  members: GroupMember[];
  expenses?: {
    amount: number;
    paid_by_user_id: string;
    expense_participants: {
      user_id: string;
      share_amount: number | null;
      share_percentage: number | null;
    }[];
  }[];
  currency?: string;
}

export const GroupMemberChips = ({ 
  members, 
  expenses = [], 
  currency = 'EUR' 
}: GroupMemberChipsProps) => {
  const calculateBalance = (userId: string): number => {
    let balance = 0;
    
    expenses.forEach(expense => {
      // Add full amount for expenses paid by this user
      if (expense.paid_by_user_id === userId) {
        balance += expense.amount;
      }

      // Subtract participant's share
      expense.expense_participants.forEach(participant => {
        if (participant.user_id === userId) {
          const share = participant.share_amount || 
            (participant.share_percentage ? (expense.amount * participant.share_percentage / 100) : 
            (expense.amount / expense.expense_participants.length));
          
          balance -= share;
        }
      });
    });

    return Number(balance.toFixed(2));
  };

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency
  });

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {members?.map((member) => {
        const balance = calculateBalance(member.user_id);
        
        return (
          <Link
            key={member.profiles?.id}
            to={`/profile/${member.profiles?.id}`}
            className="inline-flex items-center pl-1 pr-3 py-1 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-neutral-200">
                <User className="h-3 w-3 text-neutral-500" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center ml-2">
              <span className="text-sm text-neutral-600 mr-2">
                {member.profiles?.display_name}
              </span>
              {balance !== 0 && (
                <span 
                  className={`text-xs font-medium ${
                    balance > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {balance > 0 ? '+' : ''}{formatter.format(Math.abs(balance))}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
