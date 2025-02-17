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
  const currentParticipants = (watch("participants") || []).map(p => p.user_id);
  const paidByUserId = watch("paidByUserId");
  const spreadType = watch("spreadType") || 'equal';

  // Round up to ensure totals match perfectly
  const roundUp = (value: number): number => {
    return Math.ceil(value * 100) / 100;
  };

  // Safely format number to 2 decimal places
  const formatNumber = (num: number | null | undefined): number => {
    if (num === null || num === undefined) return 0;
    return Number(Number(num).toFixed(2));
  };

  // Calculate equal shares based on current participants and total amount
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
    const currentParticipantsList = watch("participants") || [];
    
    if (spreadType === 'equal' || currentParticipantsList.length === 0) {
      const equalShare = 100 / currentParticipants.length;
      const equalAmount = totalAmount / currentParticipants.length;
      
      const newParticipants = currentParticipants.map(userId => ({
        user_id: userId,
        share_percentage: roundUp(equalShare),
        share_amount: roundUp(equalAmount)
      }));
      
      setValue("participants", newParticipants);
    } else if (spreadType === 'amount') {
      // Update percentages based on amounts
      const newParticipants = currentParticipantsList.map(p => ({
        ...p,
        share_percentage: totalAmount > 0 ? roundUp((p.share_amount / totalAmount) * 100) : 0
      }));
      setValue("participants", newParticipants);
    } else {
      // For percentage, update amounts based on percentages
      const newParticipants = currentParticipantsList.map(p => ({
        ...p,
        share_amount: roundUp((totalAmount * p.share_percentage) / 100)
      }));
      setValue("participants", newParticipants);
    }
  }, [spreadType, currentParticipants.length, totalAmount]);

  // Initialize participants if empty
  useEffect(() => {
    if (groupMembers.length > 0 && (!currentParticipants || currentParticipants.length === 0)) {
      const initialParticipants = groupMembers.map(member => ({
        user_id: member.user_id,
        share_percentage: 100 / groupMembers.length,
        share_amount: totalAmount / groupMembers.length
      }));
      setValue("participants", initialParticipants);
    }
  }, [groupMembers, currentParticipants, setValue, totalAmount]);

  // Set default payer if none selected
  useEffect(() => {
    if (currentParticipants.length > 0 && !paidByUserId) {
      setValue("paidByUserId", currentParticipants[0]);
    }
  }, [currentParticipants, paidByUserId, setValue]);

  const handleParticipantToggle = (userId: string, checked: boolean) => {
    const currentParticipantsList = watch("participants") || [];
    
    const newParticipants = checked 
      ? [...currentParticipantsList, { 
          user_id: userId,
          share_percentage: 100 / (currentParticipantsList.length + 1),
          share_amount: totalAmount / (currentParticipantsList.length + 1)
        }]
      : currentParticipantsList.filter(p => p.user_id !== userId);
    
    setValue("participants", newParticipants);

    if (!checked && paidByUserId === userId) {
      setValue("paidByUserId", newParticipants[0]?.user_id || "");
    }
  };

  const handleSharePercentageChange = (userId: string, value: number) => {
    const formattedValue = roundUp(value);
    const currentParticipantsList = watch("participants") || [];
    const newParticipants = currentParticipantsList.map(p => 
      p.user_id === userId 
        ? { 
            ...p, 
            share_percentage: formattedValue,
            share_amount: roundUp((totalAmount * formattedValue) / 100)
          }
        : p
    );
    setValue("participants", newParticipants);
  };

  const handleShareAmountChange = (userId: string, value: number) => {
    const formattedValue = roundUp(value);
    const currentParticipantsList = watch("participants") || [];
    const newParticipants = currentParticipantsList.map(p => 
      p.user_id === userId 
        ? { 
            ...p, 
            share_amount: formattedValue,
            share_percentage: totalAmount > 0 ? roundUp((formattedValue / totalAmount) * 100) : 0
          }
        : p
    );
    setValue("participants", newParticipants);
  };

  // Calculate total shared amount and check if balanced
  const totalSharedAmount = formatNumber(
    (watch("participants") || []).reduce((sum, p) => sum + (p.share_amount || 0), 0)
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
          const participant = (watch("participants") || []).find(p => p.user_id === member.user_id);
          const sharePercentage = roundUp(participant?.share_percentage || 0);
          const shareAmount = roundUp(participant?.share_amount || 0);
          
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
