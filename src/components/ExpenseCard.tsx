
import { formatDistance } from "date-fns";
import { DollarSign, Users } from "lucide-react";
import { currencies } from "@/lib/currencies";

interface ExpenseCardProps {
  title: string;
  amount: number;
  currency: string;
  date: Date;
  paidBy: string;
  participants: string[];
  onClick?: () => void;
}

export const ExpenseCard = ({
  title,
  amount,
  currency,
  date,
  paidBy,
  participants,
  onClick,
}: ExpenseCardProps) => {
  const currencySymbol = currencies.find(c => c.code === currency)?.symbol || currency;

  return (
    <div
      onClick={onClick}
      className="card p-4 mb-4 cursor-pointer expense-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg text-neutral-900">{title}</h3>
            <p className="text-sm text-neutral-500">
              {formatDistance(date, new Date(), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-neutral-900">
            {currencySymbol}{amount.toFixed(2)}
          </p>
          <p className="text-sm text-neutral-500">Paid by {paidBy}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-neutral-500">
        <Users className="w-4 h-4" />
        <p className="text-sm">{participants.length} people</p>
      </div>
    </div>
  );
};
