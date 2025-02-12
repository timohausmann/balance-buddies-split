
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";

interface GroupRowProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  groupOptions: { value: string; label: string; }[];
}

export function GroupRow({
  watch,
  setValue,
  groupOptions,
}: GroupRowProps) {
  return (
    <BaseSelect
      label="Group"
      required
      value={watch("groupId")}
      onValueChange={(value) => setValue("groupId", value)}
      options={groupOptions}
    />
  );
}
