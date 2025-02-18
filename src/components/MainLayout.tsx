
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "./layout/AppHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader displayName={profile?.display_name} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
