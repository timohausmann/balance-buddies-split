
import { getCurrencySymbol } from "@/lib/currencies";

interface CurrencyIconProps {
  currency: string;
  className?: string;
}

export const CurrencyIcon = ({ currency, className = "" }: CurrencyIconProps) => {
  return (
    <div className={`w-10 h-10 bg-primary/10 flex items-center justify-center rounded text-2xl ${className}`}>
      <span className="text-primary font-medium">
        {getCurrencySymbol(currency)}
      </span>
    </div>
  );
};
