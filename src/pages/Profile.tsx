import { MainLayout } from "@/components/MainLayout";
import { ProfileView } from "@/components/ProfileView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { isLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <MainLayout>
      {isLoading ? (
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4 bg-neutral-100" />
          <Skeleton className="h-8 w-48 mx-auto mb-4 bg-neutral-100" />
          <Skeleton className="h-32 w-full bg-neutral-100" />
        </div>
      ) : (
        <ProfileView sessionUserId={session?.user?.id} />
      )}
    </MainLayout>
  );
};

export default Profile;
