
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormValues, GroupMember } from "./expense/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TitleGroupRow } from "./expense/TitleGroupRow";
import { AmountCurrencyRow } from "./expense/AmountCurrencyRow";
import { PaidByDateRow } from "./expense/PaidByDateRow";
import { ParticipantsSection } from "./expense/ParticipantsSection";
import { SplitTypeRow } from "./expense/SplitTypeRow";
import { DescriptionRow } from "./expense/DescriptionRow";

interface CreateExpenseFormProps {
  groupId?: string;
  groupMembers: GroupMember[];
  defaultCurrency: string;
  onSuccess: () => void;
}

export function CreateExpenseForm({ 
  groupId, 
  groupMembers, 
  defaultCurrency, 
  onSuccess 
}: CreateExpenseFormProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        displayName: profile?.display_name || 'Me'
      };
    }
  });

  const { data: userGroups } = useQuery({
    queryKey: ['user-groups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          default_currency,
          group_members!inner(
            user_id,
            profiles(
              id,
              display_name
            )
          )
        `)
        .eq('group_members.user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: true
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      currency: defaultCurrency,
      spreadType: 'equal',
      paidByUserId: '',
      participantIds: [],
      groupId: groupId || '',
      expenseDate: new Date().toISOString().slice(0, 16)
    }
  });

  useEffect(() => {
    if (currentUser?.id) {
      setValue('paidByUserId', currentUser.id);
      const currentParticipants = watch("participantIds");
      if (currentParticipants.length === 0) {
        setValue('participantIds', [currentUser.id]);
      }
    }
  }, [currentUser, setValue, watch]);

  const selectedGroupId = watch("groupId");
  const selectedGroup = userGroups?.find(g => g.id === selectedGroupId);

  useEffect(() => {
    if (selectedGroup) {
      setValue("currency", selectedGroup.default_currency);
    }
  }, [selectedGroup, setValue]);

  const paidByOptions = currentUser ? [
    { value: currentUser.id, label: `Me (${currentUser.displayName})` },
    ...(selectedGroup?.group_members || [])
      .filter(member => member.user_id !== currentUser.id)
      .map(member => ({
        value: member.user_id,
        label: member.profiles?.display_name || 'Unknown'
      }))
  ] : [];

  const groupOptions = userGroups?.map(group => ({
    value: group.id,
    label: group.title
  })) || [];

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
          group_id: data.groupId,
          expense_date: new Date(data.expenseDate).toISOString(),
          created_by_user_id: currentUser?.id
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

      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });

      toast({
        title: "Expense created",
        description: "Your expense has been recorded successfully."
      });
      onSuccess();
    } catch (error: any) {
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
        <TitleGroupRow 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          groupOptions={groupOptions}
        />

        <AmountCurrencyRow 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />

        <PaidByDateRow 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          paidByOptions={paidByOptions}
        />

        <ParticipantsSection
          groupMembers={selectedGroup?.group_members || groupMembers}
          watch={watch}
          setValue={setValue}
        />

        <SplitTypeRow 
          watch={watch}
          setValue={setValue}
        />

        <DescriptionRow 
          register={register}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Expense"}
      </Button>
    </form>
  );
}
