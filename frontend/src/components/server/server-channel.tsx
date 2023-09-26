import {
  Channel,
  ChannelType,
  MemberRole,
  Server,
  ServerWithChannelsWithMembersWithProfiles,
} from "@/models";
import {
  Edit,
  Hash,
  Lock,
  LucideIcon,
  Mic,
  Trash,
  VideoIcon,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../action-tooltip";
import { ModalType, useModalStore } from "@/hooks/use-modal-store";

interface ServerChannelProps {
  channel: Channel;
  server: ServerWithChannelsWithMembersWithProfiles;
  role?: MemberRole;
}

const channelIconMap: Record<ChannelType, LucideIcon> = {
  TEXT: Hash,
  AUDIO: Mic,
  VIDEO: VideoIcon,
};

export const ServerChannel = ({
  channel,
  server,
  role,
}: ServerChannelProps) => {
  const [_match, params] = useRoute("/servers/:serverId/channels/:channelId");
  const [_location, setLocation] = useLocation();
  const { onOpen } = useModalStore();

  const Icon = channelIconMap[channel.type];

  const handleClick = () => {
    setLocation(`/servers/${server.id}/channels/${channel.id}`);
  };

  const handleAction = (e: React.MouseEvent, action: ModalType) => {
    e.stopPropagation();
    onOpen(action, { server, channel });
  };

  return (
    <button
      onClick={() => handleClick()}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition text-start",
          params?.channelId === channel.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== "GUEST" && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit" side="top">
            <Edit
              onClick={(e) => handleAction(e, "editChannel")}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete" side="top">
            <Trash
              onClick={(e) => handleAction(e, "deleteChannel")}
              className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
};
