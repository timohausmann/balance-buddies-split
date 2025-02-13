
import { Switch } from "@/components/ui/switch";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { UserRound, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

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
    <div className="space-y-2">
      {groupMembers.map((member) => {
        const isParticipant = currentParticipants.includes(member.user_id);
        const isPayer = paidByUserId === member.user_id;
        
        return (
          <div
            key={member.user_id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
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
                // If we're disabling a participant who was the payer, reset the payer
                if (!checked && isPayer) {
                  setValue("paidByUserId", "");
                }
              }}
            />

            <button
              onClick={() => {
                if (isParticipant) {
                  setValue("paidByUserId", member.user_id);
                }
              }}
              disabled={!isParticipant}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${
                isPayer 
                  ? "bg-green-100 text-green-700" 
                  : isParticipant 
                    ? "hover:bg-neutral-100" 
                    : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isPayer ? (
                <Wallet className="h-4 w-4" />
              ) : (
                <UserRound className={`h-4 w-4 ${
                  isParticipant ? "text-neutral-500" : "text-neutral-300"
                }`} />
              )}
              <span className={`transition-opacity ${
                isParticipant ? "opacity-100" : "opacity-40"
              }`}>
                {member.profiles?.display_name}
              </span>
            </button>

            {isParticipant && (
              <div className="flex items-center gap-3 ml-auto">
                <Slider
                  value={[0]} // TODO: Connect to share percentage
                  onValueChange={(values) => {
                    // TODO: Update share percentage
                    console.log(values[0]);
                  }}
                  max={100}
                  step={1}
                  className="w-32"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={0} // TODO: Connect to share percentage
                  onChange={(e) => {
                    // TODO: Update share percentage
                    console.log(e.target.value);
                  }}
                  className="w-20"
                />
                <span className="text-sm text-neutral-500">%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
