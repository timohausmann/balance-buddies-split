
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="h-12 w-12 text-neutral-400" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">John Doe</h1>
          <p className="text-neutral-500">Member since January 2024</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Shared Groups</h2>
          
          {/* Placeholder for group cards */}
          <div className="card p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Sample Group</h3>
                <p className="text-sm text-neutral-500">4 members</p>
              </div>
              <Button variant="outline" size="sm">View Group</Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
