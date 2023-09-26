import { useRoute } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getChannel, getCurrentMember } from "@/api";
import { LoadingScreen } from "@/components/loading-screen";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";

export const ChannelPage = () => {
  const [_match, params] = useRoute("/servers/:serverId/channels/:channelId");
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(["accessToken"]);

  const { data: channel, isLoading: channelIsLoading } = useQuery({
    queryKey: ["channel", params!.channelId],
    queryFn: async () => {
      return await getChannel(
        accessToken!,
        params!.serverId,
        params!.channelId
      );
    },
    enabled: queryClient.getQueryData(["accessToken"]) !== undefined,
    useErrorBoundary: true,
  });

  const { data: currentMember, isLoading: currentMemberIsLoading } = useQuery({
    queryKey: ["currentMember", params?.serverId],
    queryFn: async () => {
      return await getCurrentMember(accessToken!, params?.serverId!);
    },
    enabled: !!params?.serverId && !!accessToken,
    useErrorBoundary: true,
  });

  if (channelIsLoading || currentMemberIsLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel?.name!}
        serverId={params!.serverId}
        type="channel"
      />
      {channel?.type === "TEXT" && (
        <>
          <ChatMessages
            member={currentMember!}
            name={channel?.name!}
            chatId={channel!.id}
            type="channel"
            socketQuery={{
              channelId: channel!.id,
              serverId: channel!.serverId,
            }}
            paramKey="channelId"
            paramValue={channel!.id}
          />
          <ChatInput
            name={channel?.name!}
            type="channel"
            query={{
              channelId: channel!.id,
              serverId: channel!.serverId,
            }}
          />
        </>
      )}
      {channel?.type === "AUDIO" && (
        <MediaRoom chatId={channel!.id} video={false} audio={true} />
      )}
      {channel?.type === "VIDEO" && (
        <MediaRoom chatId={channel!.id} video={true} audio={true} />
      )}
    </div>
  );
};
