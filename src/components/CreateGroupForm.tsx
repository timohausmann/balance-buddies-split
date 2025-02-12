
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currencies } from "@/lib/currencies";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        <Label htmlFor="currency" className="flex items-center gap-1">
          Default Currency
          <span className="text-red-500">*</span>
        </Label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.code} ({curr.symbol}) - {curr.name}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
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
