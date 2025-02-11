
export interface Group {
  id: string;
  title: string;
  description?: string;
  group_members?: {
    user_id: string;
  }[];
}
