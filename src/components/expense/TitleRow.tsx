
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormValues } from "./types";

interface TitleRowProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
}

export function TitleRow({
  register,
  errors,
}: TitleRowProps) {
  return (
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
  );
}
