
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroupsList } from "@/components/GroupsList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateGroupForm } from "@/components/CreateGroupForm";

const Index = () => {
  const { toast } = useToast();
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
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

  const { data: groups, refetch } = useQuery({
    queryKey: ['groups', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          description,
          default_currency,
          group_members!inner (
            user_id
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  const visibleGroups = showAllGroups ? groups : groups?.slice(0, 8);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {profile?.display_name ? `Hello, ${profile.display_name}` : "Hello!"}
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
              </DialogHeader>
              <CreateGroupForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </header>

        <div className="space-y-8">
          {groups?.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              Start off by creating your first group
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
              <GroupsList groups={visibleGroups || []} />
              {groups && groups.length > 8 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setShowAllGroups(!showAllGroups)}
                >
                  {showAllGroups ? (
                    <>
                      Show less <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
