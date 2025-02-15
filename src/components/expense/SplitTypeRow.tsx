
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";
import { DivideIcon, PercentIcon, CoinsIcon } from "lucide-react";

interface SplitTypeRowProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function SplitTypeRow({
  watch,
  setValue,
}: SplitTypeRowProps) {
  return (
    <ToggleGroup
      type="single"
      value={watch("spreadType")}
      onValueChange={(value) => {
        if (value) setValue("spreadType", value);
      }}
      className="flex justify-start"
    >
      <ToggleGroupItem value="equal" aria-label="Equal split">
        <DivideIcon className="h-4 w-4 mr-2" />
        Equal
      </ToggleGroupItem>
      <ToggleGroupItem value="percentage" aria-label="Percentage split">
        <PercentIcon className="h-4 w-4 mr-2" />
        Percentage
      </ToggleGroupItem>
      <ToggleGroupItem value="amount" aria-label="Fixed amount split">
        <CoinsIcon className="h-4 w-4 mr-2" />
        Amount
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
