
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currencies } from "@/lib/currencies";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseSelect } from "@/components/ui/base-select";

interface CreateGroupFormProps {
  onSuccess: () => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [customCurrency, setCustomCurrency] = useState("");
  const { toast } = useToast();

  const currencyOptions = [
    ...currencies.map((curr) => ({
      value: curr.code,
      label: `${curr.code} (${curr.symbol}) - ${curr.name}`,
    })),
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('groups')
        .insert([
          {
            title,
            description: description || null,
            default_currency: currency === 'other' ? customCurrency : currency,
            default_spread: 'equal'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setTitle("");
      setDescription("");
      setCurrency("EUR");
      setCustomCurrency("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-1">
          Group Name
          <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="title" 
          placeholder="Enter group name" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          placeholder="Enter group description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <BaseSelect
          label="Default Currency"
          required
          options={currencyOptions}
          value={currency}
          onValueChange={setCurrency}
          placeholder="Select currency..."
        />
        {currency === 'other' && (
          <div className="mt-2">
            <Input
              placeholder="Enter currency code (e.g. THB)"
              value={customCurrency}
              onChange={(e) => setCustomCurrency(e.target.value.slice(0, 24))}
              required
            />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Group"}
      </Button>
    </form>
  );
}
