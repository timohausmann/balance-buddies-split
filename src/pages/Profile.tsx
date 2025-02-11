
import { MainLayout } from "@/components/MainLayout";
import { ProfileView } from "@/components/ProfileView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <MainLayout>
      <ProfileView sessionUserId={session?.user?.id} />
    </MainLayout>
  );
};

export default Profile;
