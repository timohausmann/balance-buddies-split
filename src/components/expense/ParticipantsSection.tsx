
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ParticipantsSectionProps {
  groupMembers: Array<{
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
    } | null;
  }>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

export function ParticipantsSection({
  groupMembers,
  watch,
  setValue,
}: ParticipantsSectionProps) {
  const currentParticipants = watch("participantIds");

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
        displayName: profile?.display_name || 'Unknown'
      };
    }
  });

  if (!groupMembers.length) {
    return null;
  }

  return (
    <div>
      <Label>Participants</Label>
      <div className="space-y-2 mt-2">
        {groupMembers.map((member) => {
          const isParticipant = currentParticipants.includes(member.user_id);
          const isCurrentUser = member.user_id === currentUser?.id;
          
          return (
            <div
              key={member.user_id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                isParticipant ? "bg-neutral-50" : "bg-neutral-50/50"
              }`}
            >
              <Switch
                id={`participant-${member.user_id}`}
                checked={isParticipant}
                onCheckedChange={(checked) => {
                  setValue(
                    "participantIds",
                    checked
                      ? [...currentParticipants, member.user_id]
                      : currentParticipants.filter(id => id !== member.user_id)
                  );
                }}
              />
              <UserRound className={`h-5 w-5 transition-colors ${
                isParticipant ? "text-neutral-500" : "text-neutral-300"
              }`} />
              <Label
                htmlFor={`participant-${member.user_id}`}
                className={`cursor-pointer transition-opacity ${
                  isParticipant ? "opacity-100" : "opacity-40"
                }`}
              >
                {member.profiles?.display_name}
                {isCurrentUser && " (Me)"}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
