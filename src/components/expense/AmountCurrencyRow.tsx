
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { currencies } from "@/lib/currencies";

interface AmountCurrencyRowProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function AmountCurrencyRow({
  register,
  errors,
  watch,
  setValue,
}: AmountCurrencyRowProps) {
  const currencyOptions = currencies.map((curr) => ({
    value: curr.code,
    label: `${curr.code} (${curr.symbol})`
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0"
          {...register("amount", { 
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be greater than 0" }
          })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500 mt-1">{errors.amount.message as string}</p>
        )}
      </div>

      <div>
        <BaseSelect
          label="Currency"
          required
          value={watch("currency")}
          onValueChange={(value) => setValue("currency", value)}
          options={currencyOptions}
        />
      </div>
    </div>
  );
}
