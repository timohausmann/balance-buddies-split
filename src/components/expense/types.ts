
export interface FormValues {
  title: string;
  amount: string;
  currency: string;
  spreadType: string;
  description?: string;
  paidByUserId: string;
  participantIds: string[];
  groupId: string;
  expenseDate: string;
}

export interface GroupMember {
  user_id: string;
  profiles: {
    id: string;
    display_name: string;
  } | null;
}
