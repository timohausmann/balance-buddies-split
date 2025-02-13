
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
    <div className={`flex items-center gap-3 py-1 px-3 rounded-lg transition-all bg-neutral-50 ${
      isParticipant ? "opacity-100" : "opacity-50"
    }`}>
      <div className="flex items-center gap-2 flex-1">
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
          <div className="w-[120px] shrink-0">
            <Slider
              defaultValue={[localShare]}
              value={[localShare]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="relative flex w-full touch-none select-none items-center"
            />
          </div>
          <div className="relative w-20 shrink-0">
            <Input
              type="number"
              min={0}
              max={100}
              value={localShare}
              onChange={handleInputChange}
              className="pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
              %
            </span>
          </div>
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
