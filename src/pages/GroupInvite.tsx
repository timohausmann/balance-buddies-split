
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ValidatedInvitation } from "@/types";

const GroupInvite = () => {
  const { id: token } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: invitation } = useQuery<ValidatedInvitation>({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) throw new Error('No invitation token provided');

      const { data, error } = await supabase
        .rpc('validate_invitation_token', { p_token: token })
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session && invitation) {
        // Check if user is already a member
        const { data, error } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', invitation.group_id)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          setIsMember(true);
        }
      }
    };

    checkAuth();
  }, [invitation]);

  const handleAcceptInvite = async () => {
    if (!invitation) return;
    
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
          group_id: invitation.group_id,
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
        navigate(`/groups/${invitation.group_id}`);
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

  if (!invitation) {
    return (
      <>
        <PublicHeader session={session} />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-red-600">
                Invalid or Expired Invitation
              </h1>
              <p className="text-neutral-600">
                This invitation link is either invalid or has expired.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader session={session} />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">
              You've been invited to join
            </h1>
            <h2 className="text-3xl font-bold text-primary">
              {invitation.group_name}
            </h2>

            {isAuthenticated ? (
              <>
                {isMember ? (
                  <>
                    <p className="text-neutral-600">You are already in this group</p>
                    <Button 
                      onClick={() => navigate(`/groups/${invitation.group_id}`)} 
                      className="w-full"
                    >
                      Go to group
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleAcceptInvite} 
                    className="w-full"
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Accept Invitation"}
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-600">
                  To join this group, please create a free account
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
