
export interface Profile {
  id: string;
  display_name: string;
}

export interface GroupMember {
  is_admin: boolean;
  user_id: string;
  profiles: Profile;
}

export interface Group {
  id: string;
  title: string;
  description: string | null;
  default_currency: string;
  group_members: GroupMember[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  spread_type: string;
  description?: string;
  paid_by_user_id: string;
  group_id: string;
  expense_date: string;
  expense_participants: ExpenseParticipant[];
};

export interface ExpenseParticipant {
  user_id: string;
  share_percentage?: number;
  share_amount?: number;
}

