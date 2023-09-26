import { useLocation, useRoute } from "wouter";
import { Video, VideoOff } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatVideo } from "@/hooks/use-chat-video";

export const ChatVideoButton = () => {
  const queryClient = useQueryClient();
  const [_match, params] = useRoute(
    "/servers/:serverId/conversations/:memberId"
  );
  const { isVideoOpen, toggleVideo } = useChatVideo();

  const handleOnClick = () => {
    toggleVideo();
  };

  const Icon = isVideoOpen ? VideoOff : Video;
  const tooltipLabel = isVideoOpen ? "End video call" : "Start Video call";

  return (
    <ActionTooltip side="bottom" label={tooltipLabel}>
      <button
        onClick={handleOnClick}
        className="hover:opacity-75 transition mr-4"
      >
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};
