import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Initialize form values when profile data is loaded
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [profile, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate password fields
      if (currentPassword && !newPassword) {
        toast({
          title: "New password required",
          description: "Please enter a new password or clear the current password field.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      let emailUpdateInitiated = false;

      // Handle auth-specific updates (email/password)
      if (email !== session?.user?.email || newPassword) {
        const authUpdates: {
          email?: string;
          password?: string;
        } = {};

        if (email !== session?.user?.email) {
          authUpdates.email = email;
          emailUpdateInitiated = true;
        }

        if (newPassword) {
          if (!currentPassword) {
            toast({
              title: "Current password required",
              description: "Please enter your current password to change it.",
              variant: "destructive",
            });
            setIsSubmitting(false);
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
            setIsSubmitting(false);
            return;
          }

          authUpdates.password = newPassword;
        }

        // Update auth if needed
        if (Object.keys(authUpdates).length > 0) {
          const { error: authError } = await supabase.auth.updateUser(authUpdates);
          if (authError) throw authError;

          // Show email confirmation toast if email was changed
          if (authUpdates.email) {
            toast({
              title: "Email update initiated",
              description: "A confirmation email has been sent to your new email address. Please check your inbox.",
            });
          }
        }
      }

      // Update profile display name in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user?.id);

      if (profileError) throw profileError;

      // Only show the general success toast if email wasn't updated
      if (!emailUpdateInitiated) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
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

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
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
                <p className="text-sm text-neutral-500">
                  Password must be at least 8 characters long and contain letters and digits
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditProfile;
