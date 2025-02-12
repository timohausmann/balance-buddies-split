
export interface Group {
  id: string;
  title: string;
  description?: string;
  default_currency: string;
  group_members?: {
    user_id: string;
  }[];
}
