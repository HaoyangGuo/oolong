import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { MessageWithMemberWithProfile } from "@/models";
import { useEffect } from "react";

type ChatSocketParams = {
  addKey: string;
  deleteKey: string;
  queryKey: string;
};

export const useChatSocket = ({
  addKey,
  deleteKey,
  queryKey,
}: ChatSocketParams) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.on(deleteKey, (message: MessageWithMemberWithProfile) => {
      // console.log(deleteKey, message);
      queryClient.setQueryData([queryKey], (old: any) => {
        if (!old || !old.pages || old.pages.length === 0) return old;

        const newData = old.pages.map((page: any) => {
          return {
            ...page,
            messages: page.messages.map((existingMessage: MessageWithMemberWithProfile) => {
              if (existingMessage.id === message.id) {
                return message;
              }
              return existingMessage;
            }),
          };
        });

        return {
          ...old,
          pages: newData,
        };
      });
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }

        // console.log("oldData", oldData);

        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          messages: [message, ...newData[0].messages],
        };

        // console.log("newData", newData);

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(deleteKey);
    };
  }, [queryClient, addKey, deleteKey, queryKey, socket]);
};
