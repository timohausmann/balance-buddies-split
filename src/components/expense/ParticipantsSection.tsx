
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
  const currentParticipants = watch("participantIds") || [];
  const paidByUserId = watch("paidByUserId");
  const spreadType = watch("spreadType") || 'equal';
  const [participantShares, setParticipantShares] = useState<Record<string, number>>({});
  const [participantAmounts, setParticipantAmounts] = useState<Record<string, number>>({});

  // Safely format number to 2 decimal places
  const formatNumber = (num: number | null | undefined): number => {
    if (num === null || num === undefined) return 0;
    return Number(Number(num).toFixed(2));
  };

  // Recalculate equal shares based on current participants and total amount
  const calculateEqualShares = () => {
    if (!currentParticipants.length) return { shares: {}, amounts: {} };
    
    const equalShare = formatNumber(100 / currentParticipants.length);
    const equalAmount = formatNumber(totalAmount / currentParticipants.length);
    
    const shares = currentParticipants.reduce((acc: Record<string, number>, userId: string) => {
      acc[userId] = equalShare;
      return acc;
    }, {});
    
    const amounts = currentParticipants.reduce((acc: Record<string, number>, userId: string) => {
      acc[userId] = equalAmount;
      return acc;
    }, {});
    
    return { shares, amounts };
  };

  // Initialize or update state based on spreadType changes
  useEffect(() => {
    const existingShares = watch("participantShares") || {};
    const hasExistingValues = Object.keys(existingShares).length > 0;

    if (spreadType === 'equal' || !hasExistingValues) {
      const { shares, amounts } = calculateEqualShares();
      setParticipantShares(shares);
      setParticipantAmounts(amounts);
      setValue("participantShares", shares);
    } else {
      setParticipantShares(existingShares);
      
      const newAmounts = Object.entries(existingShares).reduce((acc: Record<string, number>, [userId, share]) => {
        if (spreadType === 'percentage') {
          acc[userId] = formatNumber((totalAmount * (share || 0)) / 100);
        } else if (spreadType === 'amount') {
          acc[userId] = formatNumber(share || 0);
        }
        return acc;
      }, {});
      
      setParticipantAmounts(newAmounts);
    }
  }, [spreadType, currentParticipants.length, totalAmount]);

  // Update amounts when total amount changes (only for percentage spread type)
  useEffect(() => {
    if (spreadType === 'percentage') {
      const newAmounts = Object.entries(participantShares).reduce((acc: Record<string, number>, [userId, share]) => {
        acc[userId] = formatNumber((totalAmount * (share || 0)) / 100);
        return acc;
      }, {});
      setParticipantAmounts(newAmounts);
    }
  }, [totalAmount, spreadType, participantShares]);

  // Initialize participants if empty
  useEffect(() => {
    if (groupMembers.length > 0 && (!currentParticipants || currentParticipants.length === 0)) {
      const memberIds = groupMembers.map(member => member.user_id);
      setValue("participantIds", memberIds);
    }
  }, [groupMembers, currentParticipants, setValue]);

  // Set default payer if none selected
  useEffect(() => {
    if (currentParticipants.length > 0 && !paidByUserId) {
      setValue("paidByUserId", currentParticipants[0]);
    }
  }, [currentParticipants, paidByUserId, setValue]);

  const handleParticipantToggle = (userId: string, checked: boolean) => {
    const newParticipants = checked 
      ? [...currentParticipants, userId]
      : currentParticipants.filter(id => id !== userId);
    
    setValue("participantIds", newParticipants);

    if (spreadType === 'equal') {
      const { shares, amounts } = calculateEqualShares();
      setParticipantShares(shares);
      setParticipantAmounts(amounts);
      setValue("participantShares", shares);
    }

    if (!checked && paidByUserId === userId) {
      setValue("paidByUserId", newParticipants[0] || "");
    }
  };

  const handleSharePercentageChange = (userId: string, value: number) => {
    const formattedValue = formatNumber(value);
    const newShares = { ...participantShares, [userId]: formattedValue };
    setParticipantShares(newShares);
    setValue("participantShares", newShares);

    const newAmount = formatNumber((totalAmount * formattedValue) / 100);
    const newAmounts = { ...participantAmounts, [userId]: newAmount };
    setParticipantAmounts(newAmounts);
  };

  const handleShareAmountChange = (userId: string, value: number) => {
    const formattedValue = formatNumber(value);
    const newAmounts = { ...participantAmounts, [userId]: formattedValue };
    setParticipantAmounts(newAmounts);

    if (totalAmount > 0) {
      const newPercentage = formatNumber((formattedValue / totalAmount) * 100);
      const newShares = { ...participantShares, [userId]: newPercentage };
      setParticipantShares(newShares);
      setValue("participantShares", newShares);
    }
  };

  // Calculate total shared amount and check if balanced
  const totalSharedAmount = formatNumber(
    Object.values(participantAmounts).reduce((sum, amount) => sum + (amount || 0), 0)
  );
  const difference = formatNumber(totalAmount - totalSharedAmount);
  const isBalanced = Math.abs(difference) < 0.01;

  if (!groupMembers.length) return null;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <SplitTypeRow watch={watch} setValue={setValue} />
      </div>

      <div className="space-y-1">
        {groupMembers.map((member) => {
          const isParticipant = currentParticipants.includes(member.user_id);
          const isPayer = paidByUserId === member.user_id;
          const sharePercentage = formatNumber(participantShares[member.user_id]);
          const shareAmount = formatNumber(participantAmounts[member.user_id]);
          
          return (
            <ParticipantRow
              key={member.user_id}
              member={member}
              isParticipant={isParticipant}
              isPayer={isPayer}
              onParticipantToggle={(checked) => handleParticipantToggle(member.user_id, checked)}
              onPayerSelect={() => setValue("paidByUserId", member.user_id)}
              sharePercentage={sharePercentage}
              shareAmount={shareAmount}
              onSharePercentageChange={(value) => handleSharePercentageChange(member.user_id, value)}
              onShareAmountChange={(value) => handleShareAmountChange(member.user_id, value)}
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
