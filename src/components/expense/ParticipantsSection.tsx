
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";

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
  return (
    <div>
      <Label>Participants</Label>
      <div className="space-y-2 mt-2">
        {groupMembers.map((member) => (
          <div key={member.user_id} className="flex items-center space-x-2">
            <Switch
              id={`participant-${member.user_id}`}
              defaultChecked
              onCheckedChange={(checked) => {
                const currentParticipants = watch("participantIds");
                setValue(
                  "participantIds",
                  checked
                    ? [...currentParticipants, member.user_id]
                    : currentParticipants.filter(id => id !== member.user_id)
                );
              }}
            />
            <Label htmlFor={`participant-${member.user_id}`}>
              {member.profiles?.display_name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
