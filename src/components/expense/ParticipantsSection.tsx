
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { UserRound } from "lucide-react";

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

  return (
    <div>
      <Label>Participants</Label>
      <div className="space-y-2 mt-2">
        {groupMembers.map((member) => {
          const isParticipant = currentParticipants.includes(member.user_id);
          
          return (
            <div
              key={member.user_id}
              className="flex items-center space-x-3 p-2 bg-neutral-50 rounded-lg transition-colors"
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
              <UserRound className="h-5 w-5 text-neutral-500" />
              <Label
                htmlFor={`participant-${member.user_id}`}
                className={`cursor-pointer transition-opacity ${
                  isParticipant ? "opacity-100" : "opacity-50"
                }`}
              >
                {member.profiles?.display_name}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
