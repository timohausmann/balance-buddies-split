
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SplitTypeRow } from "./SplitTypeRow";
import { DescriptionRow } from "./DescriptionRow";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AdditionalDetailsSectionProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function AdditionalDetailsSection({
  register,
  errors,
  watch,
  setValue,
}: AdditionalDetailsSectionProps) {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="date">
        <AccordionTrigger>Date & Time</AccordionTrigger>
        <AccordionContent>
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
              <p className="text-sm text-red-500 mt-1">
                {errors.expenseDate.message as string}
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="split">
        <AccordionTrigger>Split Type</AccordionTrigger>
        <AccordionContent>
          <SplitTypeRow watch={watch} setValue={setValue} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="description">
        <AccordionTrigger>Description</AccordionTrigger>
        <AccordionContent>
          <DescriptionRow register={register} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
