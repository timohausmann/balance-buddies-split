
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { BaseSelect } from "./ui/base-select";

interface CreateExpenseFormProps {
  groupId: string;
  groupMembers: Array<{
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
    } | null;
  }>;
  defaultCurrency: string;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  amount: string;
  currency: string;
  spreadType: string;
  description?: string;
  paidByUserId: string;
  participantIds: string[];
}

export function CreateExpenseForm({ groupId, groupMembers, defaultCurrency, onSuccess }: CreateExpenseFormProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      currency: defaultCurrency,
      spreadType: 'equal',
      paidByUserId: groupMembers[0]?.user_id || '',
      participantIds: groupMembers.map(member => member.user_id)
    }
  });

  const spreadTypeOptions = [
    { value: 'equal', label: 'Equal split' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'amount', label: 'Fixed amount' }
  ];

  const paidByOptions = groupMembers.map(member => ({
    value: member.user_id,
    label: member.profiles?.display_name || 'Unknown'
  }));

  const onSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          title: data.title,
          amount: parseFloat(data.amount),
          currency: data.currency,
          spread_type: data.spreadType,
          description: data.description,
          paid_by_user_id: data.paidByUserId,
          group_id: groupId,
          created_by_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      const { error: participantsError } = await supabase
        .from('expense_participants')
        .insert(
          data.participantIds.map(userId => ({
            expense_id: expense.id,
            user_id: userId,
            share_percentage: data.spreadType === 'equal' 
              ? 100 / data.participantIds.length 
              : null
          }))
        );

      if (participantsError) throw participantsError;

      toast({
        title: "Expense created",
        description: "Your expense has been recorded successfully."
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="Dinner at Restaurant"
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { 
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" }
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <BaseSelect
            label="Currency"
            required
            value={watch("currency")}
            onValueChange={(value) => setValue("currency", value)}
            options={[
              { value: defaultCurrency, label: defaultCurrency }
            ]}
          />
        </div>

        <BaseSelect
          label="Paid by"
          required
          value={watch("paidByUserId")}
          onValueChange={(value) => setValue("paidByUserId", value)}
          options={paidByOptions}
        />

        <div>
          <Label>Participants</Label>
          <div className="space-y-2 mt-2">
            {groupMembers.map((member) => (
              <div key={member.user_id} className="flex items-center space-x-2">
                <Switch
                  id={`participant-${member.user_id}`}
                  defaultChecked
                  onCheckedChange={(checked) => {
                    const currentParticipants = watch("participantIds");
                    setValue(
                      "participantIds",
                      checked
                        ? [...currentParticipants, member.user_id]
                        : currentParticipants.filter(id => id !== member.user_id)
                    );
                  }}
                />
                <Label htmlFor={`participant-${member.user_id}`}>
                  {member.profiles?.display_name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <BaseSelect
          label="Split type"
          required
          value={watch("spreadType")}
          onValueChange={(value) => setValue("spreadType", value)}
          options={spreadTypeOptions}
        />

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Add any additional details..."
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Expense"}
      </Button>
    </form>
  );
}
