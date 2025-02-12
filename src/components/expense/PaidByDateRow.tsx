
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  if (!groupMembers.length) {
    return null;
  }

  const options = [
    {
      value: currentUserId,
      label: `Me (${groupMembers.find(m => m.user_id === currentUserId)?.profiles?.display_name || 'Me'})`
    },
    ...groupMembers
      .filter(member => member.user_id !== currentUserId)
      .map(member => ({
        value: member.user_id,
        label: member.profiles?.display_name || 'Unknown'
      }))
  ];

  return (
    <BaseSelect
      label="Paid by"
      value={watch("paidByUserId")}
      onValueChange={(value) => setValue("paidByUserId", value)}
      options={options}
    />
  );
}
