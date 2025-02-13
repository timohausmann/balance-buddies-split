
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { ParticipantRow } from "./ParticipantRow";

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

  return (
    <div className="space-y-1">
      {groupMembers.map((member) => {
        const isParticipant = currentParticipants.includes(member.user_id);
        const isPayer = paidByUserId === member.user_id;
        
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
            sharePercentage={0} // TODO: Connect to real share percentage
            onSharePercentageChange={(value) => {
              console.log(`Share percentage for ${member.user_id}: ${value}`);
            }}
          />
        );
      })}
    </div>
  );
}
