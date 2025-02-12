
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PaidByDateRowProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  groupMembers: Array<{
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
    } | null;
  }>;
}

export function PaidByDateRow({
  watch,
  setValue,
  groupMembers,
}: PaidByDateRowProps) {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      return user;
    }
  });

  const selectedGroupId = watch("groupId");
  const options = currentUser ? [
    {
      value: currentUser.id,
      label: groupMembers.find(m => m.user_id === currentUser.id)?.profiles?.display_name + " (Me)"
    },
    ...groupMembers
      .filter(member => member.user_id !== currentUser.id)
      .map(member => ({
        value: member.user_id,
        label: member.profiles?.display_name || 'Unknown'
      }))
  ] : [];

  return (
    <BaseSelect
      value={watch("paidByUserId")}
      onValueChange={(value) => setValue("paidByUserId", value)}
      options={options}
      disabled={!selectedGroupId}
      placeholder={!selectedGroupId ? "Select a group first" : "Select who paid"}
    />
  );
}
