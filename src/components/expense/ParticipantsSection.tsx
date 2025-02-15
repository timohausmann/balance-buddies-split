
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { ParticipantRow } from "./ParticipantRow";
import { Wallet } from "lucide-react";
import { useState, useEffect } from "react";

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
  const spreadType = watch("spreadType");
  const [participantShares, setParticipantShares] = useState<Record<string, number>>({});

  // Initialize shares when participants change
  useEffect(() => {
    const equalShare = currentParticipants.length > 0 
      ? 100 / currentParticipants.length 
      : 100;

    const newShares = currentParticipants.reduce((acc: Record<string, number>, userId: string) => {
      acc[userId] = equalShare;
      return acc;
    }, {});

    setParticipantShares(newShares);
    setValue("participantShares", newShares);
  }, [currentParticipants.length, setValue]);

  if (!groupMembers.length) {
    return null;
  }

  // Set first participant as payer if no payer is selected
  if (currentParticipants.length > 0 && !paidByUserId) {
    setValue("paidByUserId", currentParticipants[0]);
  }

  const handleSharePercentageChange = (userId: string, value: number) => {
    const newShares = {
      ...participantShares,
      [userId]: value
    };
    setParticipantShares(newShares);
    setValue("participantShares", newShares);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {groupMembers.map((member) => {
          const isParticipant = currentParticipants.includes(member.user_id);
          const isPayer = paidByUserId === member.user_id;
          const sharePercentage = participantShares[member.user_id] || 0;
          
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
              sharePercentage={sharePercentage}
              onSharePercentageChange={(value) => {
                handleSharePercentageChange(member.user_id, value);
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
