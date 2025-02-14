
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

interface PublicHeaderProps {
  session: Session | null;
}

export const PublicHeader = ({ session }: PublicHeaderProps) => {
  return (
    <header className="w-full border-b bg-white/50 backdrop-blur-sm fixed top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Logo href="/" />
          
          <div className="flex items-center gap-4">
            {session ? (
              <Button asChild variant="default">
                <Link to="/dashboard">Go to app</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="default">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
