
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Edit } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: group } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      if (!id) throw new Error('No group ID provided');
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
            is_admin,
            profiles (
              id,
              display_name
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{group?.title}</h1>
            <p className="text-neutral-500 line-clamp-2">
              {group?.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-500">
                {group?.group_members?.length || 0} members
              </span>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Group Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Members</h3>
                  <div className="space-y-2">
                    {group?.group_members?.map((member) => (
                      <div key={member.profiles?.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded-md">
                        <span>{member.profiles?.display_name}</span>
                        <span className="text-sm text-neutral-500">
                          {member.is_admin ? 'Admin' : 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full">Copy Invite Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="space-y-4">
          {/* Placeholder for expense cards */}
          <div className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Dinner at Restaurant</h3>
                <p className="text-sm text-neutral-500">Paid by John</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$120.00</p>
                <p className="text-sm text-neutral-500">Split equally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GroupDetail;
