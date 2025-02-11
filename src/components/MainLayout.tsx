
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, Home, Users, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MainLayoutProps {
  children: React.ReactNode;
}

interface Group {
  id: string;
  title: string;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!session) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data as Group[];
    },
    enabled: !!session, // Only run this query if we have a session
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session, // Only run this query if we have a session
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-lg font-semibold">Groups</span>
                  </div>
                  {groups?.map((group) => (
                    <Link
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className="ml-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      {group.title}
                    </Link>
                  ))}
                  <Link
                    to="/groups"
                    className="ml-7 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    View all groups
                  </Link>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 justify-start pl-0 text-lg font-semibold"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex w-full justify-between">
            <nav className="hidden md:flex md:gap-6 items-center">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-medium"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <div className="relative group">
                <div className="flex items-center gap-2 font-medium cursor-pointer">
                  <Users className="h-5 w-5" />
                  Groups
                </div>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md p-2 min-w-[200px]">
                  {groups?.map((group) => (
                    <Link
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral-50"
                    >
                      {group.title}
                    </Link>
                  ))}
                  <Link
                    to="/groups"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral-50"
                  >
                    View all groups
                  </Link>
                </div>
              </div>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 font-medium"
              >
                <User className="h-5 w-5" />
                {profile?.display_name}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
