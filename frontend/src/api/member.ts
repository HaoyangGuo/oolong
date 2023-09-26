import { MemberWithProfile } from "@/models";
import { ApiError } from "@/utils";

const API_URL = import.meta.env.VITE_API_URL;

export async function getCurrentMember(accessToken: string, serverId: string) {
  const res = await fetch(`${API_URL}/members/current?serverId=${serverId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as MemberWithProfile;
}