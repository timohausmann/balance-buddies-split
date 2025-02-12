import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Edit } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditGroupForm } from "@/components/EditGroupForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User } from "lucide-react";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: group, refetch } = useQuery({
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

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const isAdmin = group?.group_members?.some(
    member => member.profiles?.id === currentUser?.id && member.is_admin
  );

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    refetch();
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{group?.title}</h1>
            
            {group?.description && (
              <Collapsible
                open={isDescriptionExpanded}
                onOpenChange={setIsDescriptionExpanded}
                className="relative"
              >
                <CollapsibleTrigger className="w-full text-left">
                  <p className={`text-neutral-500 ${!isDescriptionExpanded ? 'line-clamp-2' : ''} ${!isDescriptionExpanded ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:bg-gradient-to-t after:from-neutral-50 after:to-transparent' : ''}`}>
                    {group.description}
                  </p>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-neutral-500">{group.description}</p>
                </CollapsibleContent>
              </Collapsible>
            )}

            <button
              onClick={() => setIsMembersOpen(true)}
              className="flex items-center gap-2 mt-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>{group?.group_members?.length || 0} members</span>
            </button>
          </div>

          {isAdmin && (
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </header>

        <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {group?.group_members?.map((member) => (
                <Link
                  key={member.profiles?.id}
                  to={`/profile/${member.profiles?.id}`}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-neutral-500" />
                    </div>
                    <span className="font-medium">{member.profiles?.display_name}</span>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {member.is_admin ? 'Admin' : 'Member'}
                  </span>
                </Link>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            {group && (
              <EditGroupForm
                group={group}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {/* Placeholder for expense cards */}
          <div className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Dinner at Restaurant</h3>
                <p className="text-sm text-neutral-500">Paid by John</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-neutral-900">
                  $120.00
                </p>
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
