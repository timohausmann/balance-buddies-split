
import { AuthForm } from "@/components/AuthForm";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SignUp = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <>
      <PublicHeader session={session} />
      <div className="min-h-screen bg-neutral-50 p-4 flex items-center justify-center">
        <AuthForm initialMode="signup" />
      </div>
    </>
  );
};

export default SignUp;
