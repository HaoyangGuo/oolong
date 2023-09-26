import { Channel } from "@/models";
import { ApiError } from "@/utils";

const API_URL = import.meta.env.VITE_API_URL;

export const getChannel = async (
  accessToken: string,
  serverId: string,
  channelId: string
) => {
  const res = await fetch(
    `${API_URL}/channels?channelId=${channelId}&serverId=${serverId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Channel;
};

export const createChannel = async (
  accessToken: string,
  serverId: string,
  name: string,
  type: any
) => {
  const res = await fetch(
    `${API_URL}/channels/${serverId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ name, type }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Channel;
};
