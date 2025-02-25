import { Switch } from "@/components/ui/switch";
import { UserRound, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currencies";

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
  shareAmount?: number;
  onSharePercentageChange: (value: number) => void;
  onShareAmountChange: (value: number) => void;
  totalParticipants: number;
  totalAmount: number;
  spreadType: string;
  currency: string;
}

export function ParticipantRow({
  member,
  isParticipant,
  isPayer,
  onParticipantToggle,
  onPayerSelect,
  sharePercentage = 0,
  shareAmount = 0,
  onSharePercentageChange,
  onShareAmountChange,
  totalParticipants,
  totalAmount,
  spreadType,
  currency,
}: ParticipantRowProps) {
  const [localShare, setLocalShare] = useState(sharePercentage);
  const [localAmount, setLocalAmount] = useState(shareAmount);

  useEffect(() => {
    setLocalShare(sharePercentage);
  }, [sharePercentage]);

  useEffect(() => {
    setLocalAmount(shareAmount);
  }, [shareAmount]);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setLocalShare(newValue);
    onSharePercentageChange(newValue);
  };

  const handlePercentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(100, Math.max(0, Number(e.target.value)));
    setLocalShare(newValue);
    onSharePercentageChange(newValue);
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(0, Number(e.target.value));
    setLocalAmount(newValue);
    onShareAmountChange(newValue);
  };

  return (
    <div className={`flex items-center gap-3 py-1 px-3 rounded-lg transition-all bg-neutral-50 ${isParticipant ? "opacity-100" : "opacity-50"
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
          className={`flex items-center gap-2 ${isPayer ? "text-primary" : ""
            }`}
        >
          <span className="truncate">{member.profiles?.display_name}</span>
          {isPayer && <Wallet className="h-4 w-4 shrink-0" />}
        </button>
      </div>

      {isParticipant && (
        <>
          <div className="w-[120px] shrink-0 hidden md:block">
            <Slider
              defaultValue={[localShare]}
              value={[localShare]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              disabled={spreadType !== 'percentage'}
              className={cn(
                "relative flex w-full touch-none select-none items-center",
                spreadType !== 'percentage' && "opacity-40"
              )}
            />
          </div>
          <div className="relative w-28 shrink-0">
            <Input
              type="number"
              min={0}
              max={100}
              value={localShare}
              onChange={handlePercentInputChange}
              disabled={spreadType !== 'percentage'}
              className="pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
              %
            </span>
          </div>
          <div className="relative w-32 shrink-0">
            <Input
              type="number"
              min={0}
              max={totalAmount}
              value={localAmount}
              onChange={handleAmountInputChange}
              disabled={spreadType !== 'amount'}
              className="pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
              {getCurrencySymbol(currency)}
            </span>
          </div>
        </>
      )}

      <Switch
        checked={isParticipant}
        onCheckedChange={onParticipantToggle}
      />
    </div>
  );
}
