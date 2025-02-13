
import { Switch } from "@/components/ui/switch";
import { UserRound, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface ParticipantRowProps {
  member: {
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
    } | null;
  };
  isParticipant: boolean;
  isPayer: boolean;
  onParticipantToggle: (checked: boolean) => void;
  onPayerSelect: () => void;
  sharePercentage?: number;
  onSharePercentageChange: (value: number) => void;
  totalParticipants: number;
}

export function ParticipantRow({
  member,
  isParticipant,
  isPayer,
  onParticipantToggle,
  onPayerSelect,
  sharePercentage,
  onSharePercentageChange,
  totalParticipants,
}: ParticipantRowProps) {
  const initialShare = sharePercentage ?? (100 / (totalParticipants || 1));
  const [localShare, setLocalShare] = useState(initialShare);

  useEffect(() => {
    if (sharePercentage !== undefined) {
      setLocalShare(sharePercentage);
    }
  }, [sharePercentage]);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setLocalShare(newValue);
    onSharePercentageChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(100, Math.max(0, Number(e.target.value)));
    setLocalShare(newValue);
    onSharePercentageChange(newValue);
  };

  return (
    <div className={`flex items-center gap-3 py-1 rounded-lg transition-all ${
      isParticipant ? "opacity-100" : "opacity-50"
    }`}>
      <div className="flex items-center gap-2 flex-[2]">
        <Avatar className="h-8 w-8 bg-neutral-100">
          <AvatarFallback className="flex items-center justify-center">
            <UserRound className="h-4 w-4 text-neutral-500" />
          </AvatarFallback>
        </Avatar>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (isParticipant) {
              onPayerSelect();
            }
          }}
          disabled={!isParticipant}
          className={`flex items-center gap-2 ${
            isPayer ? "text-primary" : ""
          }`}
        >
          <span className="truncate">{member.profiles?.display_name}</span>
          {isPayer && <Wallet className="h-4 w-4 shrink-0" />}
        </button>
      </div>

      {isParticipant && (
        <>
          <div className="flex-[3]">
            <Slider
              defaultValue={[localShare]}
              value={[localShare]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="relative flex w-full touch-none select-none items-center"
            />
          </div>
          <Input
            type="number"
            min={0}
            max={100}
            value={localShare}
            onChange={handleInputChange}
            className="w-20 shrink-0"
          />
        </>
      )}

      <Switch
        checked={isParticipant}
        onCheckedChange={onParticipantToggle}
        className="h-4 w-7 shrink-0"
      />
    </div>
  );
}
