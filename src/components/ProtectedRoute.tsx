
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClientComponentClient } from "@supabase/auth-helpers-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate, supabase]);

  return <>{children}</>;
};
