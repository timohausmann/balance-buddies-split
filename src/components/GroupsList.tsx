
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Group } from "@/components/layout/types";

interface GroupsListProps {
  groups?: Group[];
}

export function GroupsList({ groups = [] }: GroupsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <div key={group.id} className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold">{group.title}</h3>
          {group.description && (
            <p className="text-sm text-neutral-500">{group.description}</p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">
              {group.group_members?.length || 0} members
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/groups/${group.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
