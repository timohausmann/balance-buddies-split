
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormValues } from "./types";

interface AmountCurrencyRowProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
}

export function AmountCurrencyRow({
  register,
  errors,
}: AmountCurrencyRowProps) {
  return (
    <div>
      <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        {...register("amount", { 
          required: "Amount is required",
          min: { value: 0.01, message: "Amount must be greater than 0" }
        })}
      />
      {errors.amount && (
        <p className="text-sm text-red-500 mt-1">{errors.amount.message as string}</p>
      )}
    </div>
  );
}
