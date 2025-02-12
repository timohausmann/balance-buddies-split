
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { SplitTypeRow } from "./SplitTypeRow";
import { DescriptionRow } from "./DescriptionRow";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { Input } from "@/components/ui/input";
import { BaseSelect } from "@/components/ui/base-select";
import { currencies } from "@/lib/currencies";

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
  const currencyOptions = [
    ...currencies.map((curr) => ({
      value: curr.code,
      label: `${curr.code} (${curr.symbol}) - ${curr.name}`,
    })),
    { value: "other", label: "Other" }
  ];

  return (
    <Accordion.Root type="multiple" className="space-y-2">
      <Accordion.Item value="currency" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-4">
          <span>Currency</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <BaseSelect
            value={watch("currency")}
            onValueChange={(value) => setValue("currency", value)}
            options={currencyOptions}
          />
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="date" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-4">
          <span>Date & Time</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <Input
            type="datetime-local"
            {...register("expenseDate", { required: "Date is required" })}
          />
          {errors.expenseDate && (
            <p className="text-sm text-red-500 mt-1">
              {errors.expenseDate.message as string}
            </p>
          )}
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="split" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-4">
          <span>Split Type</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <SplitTypeRow watch={watch} setValue={setValue} />
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="description" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-4">
          <span>Description</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <DescriptionRow register={register} />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
