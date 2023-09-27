import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile, Server } from "@/models";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import React from "react";
import { useLocation, useRoute } from "wouter";
import { UserAvatar } from "@/components/user-avatar";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};
export const ServerMember = ({ member, server }: ServerMemberProps) => {
  const [_match, params] = useRoute(
    "/servers/:serverId/conversations/:memberId"
  );
  const [_location, setLocation] = useLocation();

  const icon = roleIconMap[member.role];

  const handleClick = () => {
    setLocation(`/servers/${server.id}/conversations/${member.id}`);
  };

  return (
    <button
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={() => handleClick()}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        className="h-8 w-8 md:h-8 md:w-8"
      />
      <p
        className={cn(
          "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.memberId === member.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {member.profile.username}
      </p>
      {icon}
    </button>
  );
};
