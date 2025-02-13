
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/sheet";
import { User, LogOut } from "lucide-react";
import { Group } from "./types";

interface MobileNavProps {
  groups?: Group[];
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({ groups, onClose, onLogout }: MobileNavProps) {
  return (
    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
      <nav className="flex flex-col gap-4">
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
