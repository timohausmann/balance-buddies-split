
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupInviteManagerProps {
  groupId: string;
  groupTitle: string;
}

export function GroupInviteManager({ groupId, groupTitle }: GroupInviteManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateInviteLink = async () => {
    setIsGenerating(true);
    try {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert([
          {
            group_id: groupId,
            group_name: groupTitle,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/invite/${invitation.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      
      toast({
        title: "Invite link generated!",
        description: "The invite link has been copied to your clipboard."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate invite link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateInviteLink} 
      disabled={isGenerating}
      variant="outline"
    >
      {isGenerating ? "Generating..." : "Generate Invite Link"}
    </Button>
  );
}
