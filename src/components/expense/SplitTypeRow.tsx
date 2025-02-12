
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";

interface SplitTypeRowProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function SplitTypeRow({
  watch,
  setValue,
}: SplitTypeRowProps) {
  const spreadTypeOptions = [
    { value: 'equal', label: 'Equal split' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'amount', label: 'Fixed amount' }
  ];

  return (
    <BaseSelect
      label="Split type"
      required
      value={watch("spreadType")}
      onValueChange={(value) => setValue("spreadType", value)}
      options={spreadTypeOptions}
    />
  );
}
