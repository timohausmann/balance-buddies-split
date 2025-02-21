import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const GroupInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  // Get session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Check invitation validity and get group name
  const { data: groupInfo, isLoading: isChecking } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/');
        throw new Error('No token provided');
      }

      const { data, error } = await supabase.functions.invoke('invite-check', {
        body: { token }
      });

      if (error) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/');
        throw error;
      }
      return data;
    },
    retry: false
  });

  // Check if user is already a member
  const { data: membership, isLoading: isMembershipLoading } = useQuery({
    queryKey: ['membership', token],
    queryFn: async () => {
      if (!session?.user?.id || !groupInfo?.group_id) return null;
      const { data } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupInfo.group_id)
        .eq('user_id', session.user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user && !!groupInfo?.group_id
  });

  const joinGroup = async () => {
    if (!token) return;

    try {
      setIsJoining(true);
      
      const { data, error } = await supabase.functions.invoke('invite-accept', {
        body: { token }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've successfully joined the group!",
      });

      const { group_id } = JSON.parse(data);

      // Navigate to the group
      navigate(`/groups/${group_id}`);
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join the group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <PublicHeader session={session} />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">
              {(session?.user && membership) ? (
                  <>You're already in this group</>
                ) : (
                <>You've been invited to join</>
              )}
            </h1>
            {isChecking ? (
              <Skeleton className="h-10 w-3/4 mx-auto" />
            ) : (
              <h2 className="text-3xl font-bold text-primary">
                {groupInfo?.group_name}
              </h2>
            )}
            {session?.user ? (
              membership ? (
                <div className="space-y-4">
                  <Link to={`/groups/${groupInfo?.group_id}`}>
                    <Button className="w-full">Go to group</Button>
                  </Link>
                </div>
              ) : (
                <Button 
                  onClick={joinGroup} 
                  disabled={isChecking || isJoining}
                  className="w-full"
                >
                  {isJoining ? "Joining..." : "Join Group"}
                </Button>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-600">
                  To join this group, sign up / register first, then open the link again.
                </p>
                <Button asChild className="w-full">
                  <Link to={`/signup?invite=${token}`}>
                    Sign up for free
                  </Link>
                </Button>
                <div className="text-sm text-neutral-600">
                  Already have an account?{" "}
                  <Link to={`/login?invite=${token}`} className="text-primary hover:underline">
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
