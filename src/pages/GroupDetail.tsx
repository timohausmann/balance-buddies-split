
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Edit } from "lucide-react";

const GroupDetail = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Sample Group</h1>
            <p className="text-neutral-500 line-clamp-2">
              This is a sample group description that might be longer and need to be clamped after two lines of text.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-500">4 people</span>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Group Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Members</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-md">
                      <span>John Doe</span>
                      <span className="text-sm text-neutral-500">Admin</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-md">
                      <span>Jane Smith</span>
                      <span className="text-sm text-neutral-500">Member</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Copy Invite Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="space-y-4">
          {/* Placeholder for expense cards */}
          <div className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Dinner at Restaurant</h3>
                <p className="text-sm text-neutral-500">Paid by John</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$120.00</p>
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
