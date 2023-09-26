import { getCurrentMember, initiateConversation } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/loading-screen";
import { Profile } from "@/models";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatVideo } from "@/hooks/use-chat-video";
import { MediaRoom } from "@/components/media-room";

export const ConversationPage = () => {
  const [_match, params] = useRoute(
    "/servers/:serverId/conversations/:memberId"
  );
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(["accessToken"]);
  const myProfile = queryClient.getQueryData<Profile>(["myProfile"]);

  const { isVideoOpen } = useChatVideo();

  const { data: currentMember, isLoading: currentMemberIsLoading } = useQuery({
    queryKey: ["currentMember", params?.serverId],
    queryFn: async () => {
      return await getCurrentMember(accessToken!, params?.serverId!);
    },
    enabled: !!params?.serverId && !!accessToken,
    useErrorBoundary: true,
  });

  const { data: conversation, isLoading: conversationIsLoading } = useQuery({
    queryKey: ["conversation", currentMember?.id, params?.memberId],
    queryFn: async () => {
      return await initiateConversation(
        accessToken!,
        currentMember?.id!,
        params?.memberId!
      );
    },
    enabled: !!params?.serverId && !!accessToken && !!currentMember,
    useErrorBoundary: true,
  });

  if (currentMemberIsLoading || conversationIsLoading) {
    return <LoadingScreen />;
  }

  if (!currentMember || !conversation) {
    return <Redirect to="/404" />;
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === myProfile?.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={otherMember.profile?.username!}
        imageUrl={otherMember.profile?.imageUrl!}
        serverId={params!.serverId}
        type="conversation"
      />
      {isVideoOpen && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}
      {!isVideoOpen && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile?.username!}
            chatId={conversation.id}
            type="conversation"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            name={otherMember.profile?.username!}
            type="conversation"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
  );
};
