
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrencySymbol } from "@/lib/currencies";

interface Participant {
  user_id: string;
  share_percentage: number | null;
  share_amount: number;
  participant_profile?: {
    display_name?: string;
  };
}

interface ExpenseParticipantsTableProps {
  participants: Participant[];
  spreadType: string;
  amount: number;
  currency: string;
}

export const ExpenseParticipantsTable = ({
  participants,
  spreadType,
  amount,
  currency
}: ExpenseParticipantsTableProps) => {
  const currencySymbol = getCurrencySymbol(currency);

  const calculateShareAmount = (participant: Participant) => {
    if (spreadType === 'equal') {
      return amount / participants.length;
    } else if (participant.share_percentage) {
      return (amount * participant.share_percentage) / 100;
    }
    return participant.share_amount || 0;
  };

  return (
    <div className="p-4 bg-neutral-50 rounded-lg">
      <p className="text-sm text-neutral-500 mb-2">Participants</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Share</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => {
            const shareAmount = calculateShareAmount(participant);
            return (
              <TableRow key={participant.user_id}>
                <TableCell>{participant.participant_profile?.display_name}</TableCell>
                <TableCell className="text-right">
                  {participant.share_percentage !== null 
                    ? `${participant.share_percentage}%`
                    : spreadType === 'equal' 
                      ? `${(100 / participants.length).toFixed(1)}%`
                      : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  {currencySymbol} {shareAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
