import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { Profile } from "@/models";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(["accessToken"]);

  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/livekits/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await res.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    };
    fetchToken();
  }, [accessToken, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="animate-spin h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={import.meta.env.VITE_LIVEKIT_URL}
        token={token}
        connect={true}
        video={video}
        audio={audio}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};
