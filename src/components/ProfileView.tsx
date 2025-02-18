
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileViewProps {
  sessionUserId?: string;
}

export function ProfileView({ sessionUserId }: ProfileViewProps) {
  const { id } = useParams();
  const isOwnProfile = !id || id === sessionUserId;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id || sessionUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id || sessionUserId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id || !!sessionUserId,
  });

  if (!profile && !isLoading) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          {isLoading ? (
            <Skeleton className="w-24 h-24 rounded-full" />
          ) : (
            <User className="h-12 w-12 text-neutral-400" />
          )}
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          {isLoading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-neutral-900">
                {profile.display_name}
              </h1>
              {isOwnProfile && (
                <Link to="/profile/edit">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors h-8 w-8"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-5 w-36 mx-auto" />
        ) : (
          <p className="text-neutral-500">
            Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Shared Groups</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="card p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Sample Group</h3>
                <p className="text-sm text-neutral-500">4 members</p>
              </div>
              <Button variant="outline" size="sm">View Group</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
