
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Groups = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // Add group creation logic later
    setIsDialogOpen(false);
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
                  <Input id="title" placeholder="Enter group name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Enter group description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input id="currency" placeholder="USD" />
                </div>
                <Button type="submit" className="w-full">Create Group</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Placeholder cards for groups */}
          <div className="card p-6 space-y-4">
            <h3 className="text-xl font-semibold">Sample Group</h3>
            <p className="text-sm text-neutral-500">No expenses yet</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">3 members</span>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Groups;
