
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";

interface TitleGroupRowProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  groupOptions: { value: string; label: string; }[];
}

export function TitleGroupRow({
  register,
  errors,
  watch,
  setValue,
  groupOptions,
}: TitleGroupRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
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

      <BaseSelect
        label="Group"
        required
        value={watch("groupId")}
        onValueChange={(value) => setValue("groupId", value)}
        options={groupOptions}
      />
    </div>
  );
}
