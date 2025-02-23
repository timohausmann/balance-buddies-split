
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";
import { currencies } from "@/lib/currencies";
import { useState } from "react";

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
  const [customCurrency, setCustomCurrency] = useState("");
  const selectedCurrency = watch("currency");

  const currencyOptions = [
    ...currencies.map((curr) => ({
      value: curr.code,
      label: `${curr.code} (${curr.symbol}) - ${curr.name}`,
    })),
    { value: "other", label: "Other" }
  ];

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

        <div className="space-y-2">
          <BaseSelect
            label="Currency"
            required
            value={watch("currency")}
            onValueChange={(value) => {
              setValue("currency", value);
              if (value === "other") {
                setValue("currency", customCurrency);
              }
            }}
            options={currencyOptions}
          />
          {selectedCurrency === "other" && (
            <Input
              placeholder="Enter currency code (e.g. THB)"
              value={customCurrency}
              onChange={(e) => {
                const value = e.target.value.slice(0, 24);
                setCustomCurrency(value);
                setValue("currency", value);
              }}
              required
            />
          )}
        </div>
      </div>
    </>
  );
}
