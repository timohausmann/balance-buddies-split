
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";

interface TitleAmountSectionProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
  defaultCurrency: string;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function TitleAmountSection({
  register,
  errors,
  defaultCurrency,
  watch,
  setValue,
}: TitleAmountSectionProps) {
  return (
    <>
      <div>
        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Dinner at Restaurant"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <BaseSelect
          label="Currency"
          required
          value={watch("currency")}
          onValueChange={(value) => setValue("currency", value)}
          options={[
            { value: defaultCurrency, label: defaultCurrency }
          ]}
        />
      </div>
    </>
  );
}
