
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GroupMember } from "@/types";

interface GroupMemberChipsProps {
  members: GroupMember[];
}

export const GroupMemberChips = ({ members }: GroupMemberChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {members?.map((member) => (
        <Link
          key={member.profiles?.id}
          to={`/profile/${member.profiles?.id}`}
          className="inline-flex items-center pl-1 pr-3 py-1 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
        >
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-neutral-200">
              <User className="h-3 w-3 text-neutral-500" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-neutral-600 ml-2">{member.profiles?.display_name}</span>
        </Link>
      ))}
    </div>
  );
};
