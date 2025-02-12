
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
  watch,
  setValue,
  paidByOptions,
}: PaidByDateRowProps) {
  return (
    <BaseSelect
      label="Paid by"
      value={watch("paidByUserId")}
      onValueChange={(value) => setValue("paidByUserId", value)}
      options={paidByOptions}
    />
  );
}
