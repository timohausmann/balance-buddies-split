
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GroupsList } from "@/components/GroupsList";
import { CreateGroupForm } from "@/components/CreateGroupForm";

const Groups = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: groups, refetch } = useQuery({
    queryKey: ['groups', 'full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          description,
          default_currency,
          group_members (
            user_id
          )
        `);
      
      if (error) throw error;
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Groups</h1>
            <p className="text-neutral-500">Create and manage your expense groups</p>
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

        <GroupsList groups={groups} />
      </div>
    </MainLayout>
  );
};

export default Groups;
