
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export function BaseSelect({
  options,
  value,
  onValueChange,
  label,
  required = false,
  placeholder = "Select an option...",
  className,
}: BaseSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={label} className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <select
          id={label}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            "w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            className
          )}
          required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    </div>
  );
}
