
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GroupInvite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<{ title: string; description: string | null } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('title, description')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "This group doesn't exist or has been deleted.",
          variant: "destructive",
        });
        return;
      }

      setGroup(data);
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    fetchGroup();
    checkAuth();
  }, [id, toast]);

  const handleAcceptInvite = async () => {
    setIsJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to join a group.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: id,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            description: "You're already a member of this group.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          description: "Successfully joined the group!",
        });
        navigate(`/groups/${id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to join the group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (!group) {
    return null; // or a loading spinner
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">
              You've been invited to join
            </h1>
            <h2 className="text-3xl font-bold text-primary">
              {group.title}
            </h2>
            {group.description && (
              <p className="text-neutral-600">
                {group.description}
              </p>
            )}

            {isAuthenticated ? (
              <Button 
                onClick={handleAcceptInvite} 
                className="w-full"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Accept Invitation"}
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-600">
                  To join this group, please create a free account
                </p>
                <Button asChild className="w-full">
                  <Link to={`/signup?invite=${id}`}>
                    Sign up for free
                  </Link>
                </Button>
                <div className="text-sm text-neutral-600">
                  Already have an account?{" "}
                  <Link to={`/login?invite=${id}`} className="text-primary hover:underline">
                    Log in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupInvite;
