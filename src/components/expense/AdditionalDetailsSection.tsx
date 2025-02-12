
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { SplitTypeRow } from "./SplitTypeRow";
import { DescriptionRow } from "./DescriptionRow";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { Input } from "@/components/ui/input";
import { ParticipantsSection } from "./ParticipantsSection";
import { GroupRow } from "./GroupRow";
import { PaidByDateRow } from "./PaidByDateRow";

interface AdditionalDetailsSectionProps {
  register: UseFormRegister<FormValues>;
  errors: Record<string, any>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  groupMembers: Array<{
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
    } | null;
  }>;
  groupOptions: { value: string; label: string; }[];
  defaultOpenGroup?: boolean;
}

export function AdditionalDetailsSection({
  register,
  errors,
  watch,
  setValue,
  groupMembers,
  groupOptions,
  defaultOpenGroup = false,
}: AdditionalDetailsSectionProps) {
  return (
    <Accordion.Root 
      type="multiple" 
      className="space-y-2"
      defaultValue={defaultOpenGroup ? ['group'] : []}
    >
      <Accordion.Item value="group" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Group</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <GroupRow 
            watch={watch}
            setValue={setValue}
            groupOptions={groupOptions}
          />
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="paidBy" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Paid By</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <PaidByDateRow 
            watch={watch}
            setValue={setValue}
            groupMembers={groupMembers}
          />
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="participants" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Participants</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <ParticipantsSection
            groupMembers={groupMembers}
            watch={watch}
            setValue={setValue}
          />
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="date" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
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

      {/* Split Type coming in V2
      <Accordion.Item value="split" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Split Type</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <SplitTypeRow watch={watch} setValue={setValue} />
        </Accordion.Content>
      </Accordion.Item>
      */}

      <Accordion.Item value="description" className="border-b">
        <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
          <span>Description</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <textarea
            {...register("description")}
            placeholder="Add any additional details..."
            className="w-full min-h-[100px] p-3 border rounded-md"
          />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
