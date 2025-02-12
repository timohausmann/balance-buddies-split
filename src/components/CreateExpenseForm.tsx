import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormValues, GroupMember } from "./expense/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TitleRow } from "./expense/TitleRow";
import { AmountCurrencyRow } from "./expense/AmountCurrencyRow";
import { GroupRow } from "./expense/GroupRow";
import { PaidByDateRow } from "./expense/PaidByDateRow";
import { ParticipantsSection } from "./expense/ParticipantsSection";
import { AdditionalDetailsSection } from "./expense/AdditionalDetailsSection";

interface CreateExpenseFormProps {
  groupId?: string;
  groupMembers: GroupMember[];
  defaultCurrency: string;
  onSuccess: () => void;
  expenseToEdit?: {
    id: string;
    title: string;
    amount: number;
    currency: string;
    spread_type: string;
    description?: string;
    paid_by_user_id: string;
    group_id: string;
    expense_date: string;
    expense_participants: Array<{
      user_id: string;
      share_percentage?: number;
      share_amount?: number;
    }>;
  };
}

export function CreateExpenseForm({ 
  groupId, 
  groupMembers, 
  defaultCurrency, 
  onSuccess,
  expenseToEdit
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

      // First get the groups where the user is a member
      const { data: userGroupIds, error: groupError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (groupError) throw groupError;

      // Then fetch full group details including ALL members
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          default_currency,
          group_members (
            user_id,
            profiles:profiles!group_members_user_id_fkey1 (
              id,
              display_name
            )
          )
        `)
        .in('id', userGroupIds.map(g => g.group_id));

      if (error) throw error;
      return data?.map(group => ({
        id: group.id,
        title: group.title,
        default_currency: group.default_currency,
        group_members: group.group_members
      })) || [];
    },
    enabled: true
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      title: expenseToEdit?.title || '',
      amount: expenseToEdit?.amount.toString() || '',
      currency: expenseToEdit?.currency || defaultCurrency,
      spreadType: expenseToEdit?.spread_type || 'equal',
      description: expenseToEdit?.description || '',
      paidByUserId: expenseToEdit?.paid_by_user_id || '',
      participantIds: expenseToEdit?.expense_participants.map(p => p.user_id) || [],
      groupId: expenseToEdit?.group_id || groupId || '',
      expenseDate: expenseToEdit?.expense_date 
        ? new Date(expenseToEdit.expense_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    }
  });

  const selectedGroupId = watch("groupId");
  const selectedGroup = userGroups?.find(g => g.id === selectedGroupId);

  // Replace the current user useEffect with this new one for group changes
  useEffect(() => {
    if (selectedGroup && !expenseToEdit) {
      // Set all group members as participants by default
      setValue('participantIds', selectedGroup.group_members.map(member => member.user_id));
      setValue("currency", selectedGroup.default_currency);
      
      // Set the current user as the one who paid by default
      if (currentUser?.id && !watch("paidByUserId")) {
        setValue("paidByUserId", currentUser.id);
      }
    }
  }, [selectedGroup, setValue, currentUser, expenseToEdit, watch]);

  const groupOptions = userGroups?.map(group => ({
    value: group.id,
    label: group.title
  })) || [];

  const onSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);

      if (expenseToEdit) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .update({
            title: data.title,
            amount: parseFloat(data.amount),
            currency: data.currency,
            spread_type: data.spreadType,
            description: data.description,
            paid_by_user_id: data.paidByUserId,
            group_id: data.groupId,
            expense_date: new Date(data.expenseDate).toISOString(),
          })
          .eq('id', expenseToEdit.id);

        if (expenseError) throw expenseError;

        const { error: deleteError } = await supabase
          .from('expense_participants')
          .delete()
          .eq('expense_id', expenseToEdit.id);

        if (deleteError) throw deleteError;

        const { error: participantsError } = await supabase
          .from('expense_participants')
          .insert(
            data.participantIds.map(userId => ({
              expense_id: expenseToEdit.id,
              user_id: userId,
              share_percentage: data.spreadType === 'equal' 
                ? 100 / data.participantIds.length 
                : null
            }))
          );

        if (participantsError) throw participantsError;

        toast({
          title: "Expense updated",
          description: "Your expense has been updated successfully."
        });
      } else {
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

        toast({
          title: "Expense created",
          description: "Your expense has been recorded successfully."
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['expense', expenseToEdit?.id] });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${expenseToEdit ? 'update' : 'create'} expense. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <TitleRow 
          register={register}
          errors={errors}
        />

        <AmountCurrencyRow 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />

        <AdditionalDetailsSection 
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          groupMembers={selectedGroup?.group_members || []}
          groupOptions={groupOptions}
          defaultOpenGroup={!groupId && !expenseToEdit}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (expenseToEdit ? "Saving..." : "Creating...") : (expenseToEdit ? "Save Changes" : "Create Expense")}
      </Button>
    </form>
  );
}
