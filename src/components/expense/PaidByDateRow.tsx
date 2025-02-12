
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";

interface PaidByDateRowProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  paidByOptions: { value: string; label: string; }[];
}

export function PaidByDateRow({
  register,
  errors,
  watch,
  setValue,
  paidByOptions,
}: PaidByDateRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <BaseSelect
        label="Paid by"
        required
        value={watch("paidByUserId")}
        onValueChange={(value) => setValue("paidByUserId", value)}
        options={paidByOptions}
      />

      <div>
        <Label htmlFor="expenseDate">
          Date & Time <span className="text-red-500">*</span>
        </Label>
        <Input
          type="datetime-local"
          id="expenseDate"
          {...register("expenseDate", { required: "Date is required" })}
        />
        {errors.expenseDate && (
          <p className="text-sm text-red-500 mt-1">{errors.expenseDate.message as string}</p>
        )}
      </div>
    </div>
  );
}
