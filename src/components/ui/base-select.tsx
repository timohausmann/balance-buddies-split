
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface BaseSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function BaseSelect({
  options,
  value,
  onValueChange,
  label,
  required = false,
  placeholder = "Select an option...",
}: BaseSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={label} className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
