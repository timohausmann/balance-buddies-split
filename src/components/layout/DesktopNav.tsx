
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, User, LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Group } from "./types";

interface DesktopNavProps {
  groups?: Group[];
  displayName?: string;
  onLogout: () => void;
}

export function DesktopNav({ groups, displayName, onLogout }: DesktopNavProps) {
  return (
    <div className="flex w-full justify-between">
      <nav className="hidden md:flex md:gap-6 items-center">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-medium"
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <div className="relative group">
          <div className="flex items-center gap-2 font-medium cursor-pointer">
            <Users className="h-5 w-5" />
            Groups
          </div>
          <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md p-2 min-w-[200px]">
            {groups?.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral-50"
              >
                {group.title}
              </Link>
            ))}
            <Link
              to="/groups"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-neutral-50"
            >
              View all groups
            </Link>
          </div>
        </div>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          className="hidden md:flex items-center gap-2 font-medium"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          {displayName}
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
