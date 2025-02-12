
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currencies } from "@/lib/currencies";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseSelect } from "@/components/ui/base-select";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

interface EditGroupFormProps {
  group: {
    id: string;
    title: string;
    description: string | null;
    default_currency: string;
  };
  onSuccess: () => void;
}

export function EditGroupForm({ group, onSuccess }: EditGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description || "");
  const [currency, setCurrency] = useState(group.default_currency);
  const [customCurrency, setCustomCurrency] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
        .update({
          title,
          description: description || null,
          default_currency: currency === 'other' ? customCurrency : currency,
        })
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group updated successfully",
      });

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

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete the group "${group.title}"? This action cannot be undone.`);
    
    if (!confirmed) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      navigate('/groups');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
          autoFocus={false}
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
          value={currency}
          onValueChange={setCurrency}
          options={currencyOptions}
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
      <div className="flex flex-col gap-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button" 
          variant="destructive" 
          className="w-full"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Group
        </Button>
      </div>
    </form>
  );
}
