import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";
import { ApiError } from "@/utils";
import { MessageWithMemberWithProfile } from "@/models";

interface ChatQueryParams {
  queryKey: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const useChatQuery = ({
  queryKey,
  paramKey,
  paramValue,
  type,
}: ChatQueryParams) => {
  const { isConnected } = useSocket();
  const queryClient = useQueryClient();

  const fetchMessage = async ({
    pageParam = undefined,
  }: {
    pageParam?: string;
  }) => {
    let param;

    if (pageParam) {
      param = new URLSearchParams({
        cursor: pageParam,
        [paramKey]: paramValue,
      });
    } else {
      param = new URLSearchParams({
        [paramKey]: paramValue,
      });
    }

    const res = await fetch(
      type === "channel"
        ? `${import.meta.env.VITE_API_URL}/messages?${param}`
        : `${import.meta.env.VITE_API_URL}/messages/direct?${param}`,
      {
        headers: {
          Authorization: `Bearer ${queryClient.getQueryData<string>([
            "accessToken",
          ])}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new ApiError(errorData.status, errorData.message);
    }

    const data = await res.json();

    return data as {
      messages: MessageWithMemberWithProfile[];
      nextCursor: string | null;
    };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessage,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
