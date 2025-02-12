
import { UseFormRegister } from "react-hook-form";
import { FormValues } from "./types";

interface DescriptionRowProps {
  register: UseFormRegister<FormValues>;
}

export function DescriptionRow({
  register,
}: DescriptionRowProps) {
  return (
    <textarea
      {...register("description")}
      placeholder="Add any additional details..."
      className="w-full min-h-[100px] p-3 border rounded-md"
    />
  );
}
