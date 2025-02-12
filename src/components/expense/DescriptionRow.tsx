
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import { FormValues } from "./types";

interface DescriptionRowProps {
  register: UseFormRegister<FormValues>;
}

export function DescriptionRow({
  register,
}: DescriptionRowProps) {
  return (
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        {...register("description")}
        placeholder="Add any additional details..."
      />
    </div>
  );
}
