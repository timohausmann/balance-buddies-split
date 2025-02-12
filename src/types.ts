
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
