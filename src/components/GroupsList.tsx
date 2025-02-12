
import { Link } from "react-router-dom";
import { Group } from "@/components/layout/types";
import { ChevronRight, DollarSign } from "lucide-react";
import { currencies } from "@/lib/currencies";

interface GroupsListProps {
  groups?: Group[];
}

export function GroupsList({ groups = [] }: GroupsListProps) {
  const getCurrencySymbol = (currencyCode: string) => {
    if (currencyCode === 'other') return '$';
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <Link
          key={group.id}
          to={`/groups/${group.id}`}
          className="card p-6 space-y-4 hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{group.title}</h3>
              {group.description && (
                <div className="relative">
                  <p className="text-sm text-neutral-500 line-clamp-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:bg-gradient-to-t after:from-white after:to-transparent">
                    {group.description}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-xl">
                <span className="text-primary font-medium">
                  {getCurrencySymbol(group.default_currency)}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400" />
            </div>
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <span>{group.group_members?.length || 0} members</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
