
import { getCurrencySymbol } from "@/lib/currencies";

interface ExpenseDetailsCardProps {
  amount: number;
  currency: string;
  paidByName?: string;
  spreadType: string;
  description?: string | null;
}

export const ExpenseDetailsCard = ({ 
  amount, 
  currency, 
  paidByName, 
  spreadType,
  description 
}: ExpenseDetailsCardProps) => {
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-500 mb-1">Amount</p>
          <p className="text-xl font-semibold">
            {currencySymbol} {amount.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-500 mb-1">Paid by</p>
          <p className="text-xl font-semibold">
            {paidByName}
          </p>
        </div>
      </div>

      <div className="p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-500 mb-1">Split type</p>
        <p className="font-medium capitalize">
          {spreadType}
        </p>
      </div>

      {description && (
        <div className="p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-500 mb-2">Description</p>
          <p className="whitespace-pre-wrap">{description}</p>
        </div>
      )}
    </div>
  );
};
