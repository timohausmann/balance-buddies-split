
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/sheet";
import { Home, Users, User, LogOut } from "lucide-react";
import { Group } from "./types";

interface MobileNavProps {
  groups?: Group[];
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({ groups, onClose, onLogout }: MobileNavProps) {
  return (
    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
      <nav className="flex flex-col gap-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold"
          onClick={onClose}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <div className="flex flex-col gap-2">
          <Link
            to="/groups"
            className="flex items-center gap-2 text-lg font-semibold"
            onClick={onClose}
          >
            <Users className="h-5 w-5" />
            Groups
          </Link>
          {groups?.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="ml-7 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              {group.title}
            </Link>
          ))}
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-2 text-lg font-semibold"
          onClick={onClose}
        >
          <User className="h-5 w-5" />
          My Profile
        </Link>
        <Button
          variant="ghost"
          className="flex items-center gap-2 justify-start pl-0 text-lg font-semibold"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </nav>
    </SheetContent>
  );
}
