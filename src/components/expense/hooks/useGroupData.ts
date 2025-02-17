
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGroupData() {
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          default_currency,
          group_members (
            user_id,
            profiles (
              id,
              display_name
            )
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  const groupOptions = groups?.map(group => ({
    value: group.id,
    label: group.title
  })) || [];

  return {
    groups,
    groupOptions
  };
}
