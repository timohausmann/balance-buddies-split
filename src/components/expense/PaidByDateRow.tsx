
import { BaseSelect } from "@/components/ui/base-select";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { FormValues } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  if (!groupMembers.length) {
    return null;
  }

  const options = currentUserId ? [
    {
      value: currentUserId,
      label: groupMembers.find(m => m.user_id === currentUserId)?.profiles?.display_name + " (Me)"
    },
    ...groupMembers
      .filter(member => member.user_id !== currentUserId)
      .map(member => ({
        value: member.user_id,
        label: member.profiles?.display_name || 'Unknown'
      }))
  ] : [];

  return (
    <BaseSelect
      label="Paid by"
      value={watch("paidByUserId")}
      onValueChange={(value) => setValue("paidByUserId", value)}
      options={options}
    />
  );
}
