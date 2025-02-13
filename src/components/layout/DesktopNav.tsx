
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Group } from "./types";
import { Logo } from "./Logo";

interface DesktopNavProps {
  groups?: Group[];
  displayName?: string;
  onLogout: () => void;
}

export function DesktopNav({ groups, displayName, onLogout }: DesktopNavProps) {
  return (
    <div className="flex w-full justify-between">
      <Logo />
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
            <TooltipContent className="bg-white">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
