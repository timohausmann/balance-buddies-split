import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";
import { ParticipantRow } from "./ParticipantRow";
import { Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { SplitTypeRow } from "./SplitTypeRow";
import { Check, AlertTriangle } from "lucide-react";

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
  totalAmount: number;
}

export function ParticipantsSection({
  groupMembers,
  watch,
  setValue,
  totalAmount,
}: ParticipantsSectionProps) {
  const currentParticipants = watch("participantIds");
  const paidByUserId = watch("paidByUserId");
  const spreadType = watch("spreadType");
  const [participantShares, setParticipantShares] = useState<Record<string, number>>({});
  const [participantAmounts, setParticipantAmounts] = useState<Record<string, number>>({});

  // Initialize or update shares and amounts when relevant values change
  useEffect(() => {
    const existingShares = watch("participantShares");
    
    if (Object.keys(existingShares).length > 0) {
      setParticipantShares(existingShares);
      
      const newAmounts = Object.entries(existingShares).reduce((acc: Record<string, number>, [userId, share]) => {
        if (spreadType === 'percentage') {
          acc[userId] = (totalAmount * share) / 100;
        } else if (spreadType === 'amount') {
          acc[userId] = share;
        }
        return acc;
      }, {});
      setParticipantAmounts(newAmounts);
    } else if (spreadType === 'equal') {
      const equalShare = currentParticipants.length > 0 
        ? 100 / currentParticipants.length 
        : 100;
      const equalAmount = currentParticipants.length > 0
        ? totalAmount / currentParticipants.length
        : totalAmount;

      const newShares = currentParticipants.reduce((acc: Record<string, number>, userId: string) => {
        acc[userId] = equalShare;
        return acc;
      }, {});

      const newAmounts = currentParticipants.reduce((acc: Record<string, number>, userId: string) => {
        acc[userId] = equalAmount;
        return acc;
      }, {});

      setParticipantShares(newShares);
      setParticipantAmounts(newAmounts);
      setValue("participantShares", newShares);
    }
  }, [spreadType, currentParticipants.length, totalAmount, setValue]);

  // Update amounts when totalAmount changes
  useEffect(() => {
    if (spreadType === 'percentage') {
      const newAmounts = Object.entries(participantShares).reduce((acc: Record<string, number>, [userId, share]) => {
        acc[userId] = (totalAmount * share) / 100;
        return acc;
      }, {});
      setParticipantAmounts(newAmounts);
    }
  }, [totalAmount, spreadType, participantShares]);

  // Handle participant selection
  useEffect(() => {
    if (groupMembers.length > 0 && currentParticipants.length === 0) {
      setValue("participantIds", groupMembers.map(member => member.user_id));
    }
  }, [groupMembers, currentParticipants.length, setValue]);

  if (!groupMembers.length) {
    return null;
  }

  // Set first participant as payer if no payer is selected
  if (currentParticipants.length > 0 && !paidByUserId) {
    setValue("paidByUserId", currentParticipants[0]);
  }

  const handleSharePercentageChange = (userId: string, value: number) => {
    const newShares = { ...participantShares, [userId]: value };
    setParticipantShares(newShares);
    setValue("participantShares", newShares);

    // Update amounts based on new percentages
    const newAmounts = { ...participantAmounts };
    newAmounts[userId] = (totalAmount * value) / 100;
    setParticipantAmounts(newAmounts);
  };

  const handleShareAmountChange = (userId: string, value: number) => {
    const newAmounts = { ...participantAmounts, [userId]: value };
    setParticipantAmounts(newAmounts);

    // Keep percentage consistent
    const newShares = { ...participantShares };
    if (totalAmount > 0) {
      newShares[userId] = (value / totalAmount) * 100;
      setParticipantShares(newShares);
      setValue("participantShares", newShares);
    }
  };

  // Calculate total shared amount
  const totalSharedAmount = Object.values(participantAmounts).reduce((sum, amount) => sum + amount, 0);
  const difference = totalAmount - totalSharedAmount;
  const isBalanced = Math.abs(difference) < 0.01; // Account for floating point precision

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <SplitTypeRow watch={watch} setValue={setValue} />
      </div>

      <div className="space-y-1">
        {groupMembers.map((member) => {
          const isParticipant = currentParticipants.includes(member.user_id);
          const isPayer = paidByUserId === member.user_id;
          const sharePercentage = participantShares[member.user_id] || 0;
          const shareAmount = participantAmounts[member.user_id] || 0;
          
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
              shareAmount={shareAmount}
              onSharePercentageChange={(value) => {
                handleSharePercentageChange(member.user_id, value);
              }}
              onShareAmountChange={(value) => {
                handleShareAmountChange(member.user_id, value);
              }}
              totalParticipants={currentParticipants.length}
              totalAmount={totalAmount}
              spreadType={spreadType}
            />
          );
        })}
      </div>
      
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {isBalanced ? (
          <>
            <Check className="h-4 w-4" />
            <p className="text-sm">Shared amounts check out!</p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">
              Shared amounts {difference > 0 ? 'under' : 'over'} by {Math.abs(difference).toFixed(2)} €
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Wallet className="h-4 w-4" />
        <p>Select who paid by tapping their name.</p>
      </div>
    </div>
  );
}
