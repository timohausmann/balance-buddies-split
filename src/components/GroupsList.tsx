
import { Link } from "react-router-dom";
import { Group } from "@/components/layout/types";
import { ChevronRight } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";
import { CurrencyIcon } from "./ui/currency-icon";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupsListProps {
  groups?: Group[];
  isLoading?: boolean;
}

export function GroupsList({ groups = [], isLoading }: GroupsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 w-full">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <Link
          key={group.id}
          to={`/groups/${group.id}`}
          className="card p-6 space-y-4 hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <CurrencyIcon currency={group.default_currency} />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{group.title}</h3>
                {group.description && (
                  <div className="relative">
                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {group.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <span>{group.group_members?.length || 0} members</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
