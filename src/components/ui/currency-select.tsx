
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import { currencies } from "@/lib/currencies";

interface CurrencySelectProps {
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

export function CurrencySelect({ defaultValue, onValueChange }: CurrencySelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCurrency, setCustomCurrency] = useState("");

  const handleValueChange = (value: string) => {
    if (value === "other") {
      setShowCustomInput(true);
      onValueChange(customCurrency);
    } else {
      setShowCustomInput(false);
      onValueChange(value);
    }
  };

  const handleCustomCurrencyChange = (value: string) => {
    setCustomCurrency(value);
    onValueChange(value);
  };

  return (
    <div className="space-y-2">
      <Select
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name}
            </SelectItem>
          ))}
          <SelectItem value="other">Other...</SelectItem>
        </SelectContent>
      </Select>
      
      {showCustomInput && (
        <Input
          placeholder="Enter currency code (e.g. THB)"
          value={customCurrency}
          onChange={(e) => handleCustomCurrencyChange(e.target.value.slice(0, 3).toUpperCase())}
          maxLength={3}
        />
      )}
    </div>
  );
}
