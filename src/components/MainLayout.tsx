
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MobileNav } from "./layout/MobileNav";
import { DesktopNav } from "./layout/DesktopNav";
import { Group } from "./layout/types";

interface MainLayoutProps {
  children: React.ReactNode;
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
    queryKey: ['groups', 'navigation'],
    queryFn: async () => {
      if (!session) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data as Group[];
    },
    enabled: !!session,
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
    enabled: !!session,
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
            <MobileNav
              groups={groups}
              onClose={() => setIsOpen(false)}
              onLogout={handleLogout}
            />
          </Sheet>
          <DesktopNav
            groups={groups}
            displayName={profile?.display_name}
            onLogout={handleLogout}
          />
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
