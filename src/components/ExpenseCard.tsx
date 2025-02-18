
import { formatDistance } from "date-fns";
import { Users } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { CurrencyIcon } from "./ui/currency-icon";
import { Link } from "react-router-dom";

interface ExpenseCardProps {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  paidBy: string;
  participants: string[];
}

export const ExpenseCard = ({
  id,
  title,
  amount,
  currency,
  date,
  paidBy,
  participants,
}: ExpenseCardProps) => {
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <Link
      to={`/expenses/${id}`}
      className="block"
    >
      <div className="card p-4 mb-4 cursor-pointer expense-card hover:bg-neutral-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CurrencyIcon currency={currency} />
            <div>
              <h3 className="font-medium text-lg text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-500">
                {formatDistance(date, new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-neutral-900">
              {currencySymbol} {amount.toFixed(2)}
            </p>
            <p className="text-sm text-neutral-500">Paid by {paidBy}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-neutral-500">
          <Users className="w-4 h-4" />
          <p className="text-sm">{participants.length} people</p>
        </div>
      </div>
    </Link>
  );
}
