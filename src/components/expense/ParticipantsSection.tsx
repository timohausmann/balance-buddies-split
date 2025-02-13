
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { ParticipantRow } from "./ParticipantRow";
import { Wallet } from "lucide-react";

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
  const paidByUserId = watch("paidByUserId");

  if (!groupMembers.length) {
    return null;
  }

  // Set first participant as payer if no payer is selected
  if (currentParticipants.length > 0 && !paidByUserId) {
    setValue("paidByUserId", currentParticipants[0]);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {groupMembers.map((member) => {
          const isParticipant = currentParticipants.includes(member.user_id);
          const isPayer = paidByUserId === member.user_id;
          const equalShare = currentParticipants.length > 0 
            ? 100 / currentParticipants.length 
            : 100;
          
          return (
            <ParticipantRow
              key={member.user_id}
              member={member}
              isParticipant={isParticipant}
              isPayer={isPayer}
              onParticipantToggle={(checked) => {
                setValue(
                  "participantIds",
                  checked
                    ? [...currentParticipants, member.user_id]
                    : currentParticipants.filter(id => id !== member.user_id)
                );
                if (!checked && isPayer) {
                  setValue("paidByUserId", "");
                }
              }}
              onPayerSelect={() => {
                setValue("paidByUserId", member.user_id);
              }}
              sharePercentage={equalShare}
              onSharePercentageChange={(value) => {
                console.log(`Share percentage for ${member.user_id}: ${value}`);
              }}
              totalParticipants={currentParticipants.length}
            />
          );
        })}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Wallet className="h-4 w-4" />
        <p>Select who paid by tapping their name.</p>
      </div>
    </div>
  );
}
