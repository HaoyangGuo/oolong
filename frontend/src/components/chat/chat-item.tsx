import { Member, MemberWithProfile } from "@/models";
import React from "react";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { ShieldCheck, ShieldAlert, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { useLocation, useRoute } from "wouter";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
};

interface ChatItemProps {
  id: string;
  content: string;
  member: MemberWithProfile;
  timestamp: string;
  imageUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketQuery: Record<string, string>;
  type: "channel" | "conversation";
}

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  imageUrl,
  deleted,
  currentMember,
  isUpdated: _isUpdated,
  socketQuery,
  type,
}: ChatItemProps) => {
  const isAdmin = currentMember.role === "ADMIN";
  const isModerator = currentMember.role === "MODERATOR";
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  // const canEditMessage = !deleted && isOwner && !imageUrl;
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(["accessToken"]);
  const { toast } = useToast();
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [_match, params] = useRoute("/servers/:serverId/:any*");
  const [_location, setLocation] = useLocation();

  const handleDeleteMessage = async () => {
    setIsDeleteLoading(true);
    const res = await fetch(
      type === "channel"
        ? `${import.meta.env.VITE_API_URL}/messages/${id}`
        : `${import.meta.env.VITE_API_URL}/messages/direct/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...socketQuery,
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      toast({
        title: "Error deleting message",
        description: errorData.message as string,
      });
      setIsDeleteLoading(false);
    }

    setIsDeleteLoading(false);
  };

  const handleMemberClick = () => {
    if (member.id === currentMember.id) return;
    setLocation(`/servers/${params!.serverId}/conversations/${member.id}`);
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={handleMemberClick}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {member.profile.username}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          <p
            className={cn(
              "text-sm text-zinc-600 dark:text-zinc-300",
              deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
            )}
          >
            {content}
          </p>
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-2 overflow-hidden max-w-[280px] w-[70%] border flex items-center bg-secondary"
            >
              <img
                src={imageUrl}
                alt={content}
                className="w-full h-full object-cover"
              />
            </a>
          )}
          {canDeleteMessage && (
            <button
              disabled={isDeleteLoading}
              onClick={handleDeleteMessage}
              className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm"
            >
              <ActionTooltip label="Delete">
                <Trash className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
              </ActionTooltip>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
