
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencies } from "@/lib/currencies";

const Groups = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [customCurrency, setCustomCurrency] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: groups, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('groups')
        .insert([
          {
            title,
            description: description || null,
            default_currency: currency === 'other' ? customCurrency : currency,
            default_spread: 'equal'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setCurrency("EUR");
      setCustomCurrency("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
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
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Group Name</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter group name" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Enter group description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol}) - {curr.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {currency === 'other' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter currency code (e.g. THB)"
                        value={customCurrency}
                        onChange={(e) => setCustomCurrency(e.target.value.slice(0, 24))}
                        required
                      />
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full">Create Group</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups?.map((group) => (
            <div key={group.id} className="card p-6 space-y-4">
              <h3 className="text-xl font-semibold">{group.title}</h3>
              {group.description && (
                <p className="text-sm text-neutral-500">{group.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">
                  {group.group_members?.length || 0} members
                </span>
                <Button variant="outline" size="sm" onClick={() => navigate(`/groups/${group.id}`)}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Groups;
