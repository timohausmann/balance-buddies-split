
import { Switch } from "@/components/ui/switch";
import { UserRound, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";

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
}

export function ParticipantRow({
  member,
  isParticipant,
  isPayer,
  onParticipantToggle,
  onPayerSelect,
  sharePercentage = 0,
  onSharePercentageChange,
}: ParticipantRowProps) {
  const [localShare, setLocalShare] = useState(sharePercentage);

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
    <div className={`flex items-center gap-4 py-1 rounded-lg transition-all ${
      isParticipant ? "opacity-100" : "opacity-50"
    }`}>
      <div className="flex items-center gap-3 min-w-[200px]">
        <Avatar className="h-8 w-8 bg-neutral-100">
          <UserRound className="h-4 w-4 text-neutral-500" />
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
            isPayer ? "text-green-700" : ""
          }`}
        >
          <span>{member.profiles?.display_name}</span>
          {isPayer && <Wallet className="h-4 w-4" />}
        </button>
      </div>

      {isParticipant && (
        <>
          <div className="w-48">
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
            className="w-20"
          />
        </>
      )}

      <Switch
        checked={isParticipant}
        onCheckedChange={onParticipantToggle}
        className="h-4 w-7"
      />
    </div>
  );
}
