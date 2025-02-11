import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Build the updateUser options object
      const updateOptions: {
        email?: string;
        password?: string;
        data?: { display_name: string };
      } = {};

      // Only include changed values
      if (email !== session?.user?.email) {
        updateOptions.email = email;
      }

      if (newPassword) {
        if (!currentPassword) {
          toast({
            title: "Current password required",
            description: "Please enter your current password to change it.",
            variant: "destructive",
          });
          return;
        }
        // Verify current password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: session?.user?.email || '',
          password: currentPassword,
        });

        if (signInError) {
          toast({
            title: "Invalid current password",
            description: "Please check your current password and try again.",
            variant: "destructive",
          });
          return;
        }

        updateOptions.password = newPassword;
      }

      // Update display name through user metadata to batch it with other changes
      updateOptions.data = { display_name: displayName };

      // Make a single updateUser call with all changes
      const { error: updateError } = await supabase.auth.updateUser(updateOptions);
      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profile || !session) {
    return (
      <MainLayout>
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Edit Profile</h1>
          <p className="text-neutral-500">Update your personal information</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Required to change password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditProfile;
