import { ConversationWithMembersWithProfile } from "@/models";
import { ApiError } from "@/utils";

const API_URL = import.meta.env.VITE_API_URL;

export async function initiateConversation (accessToken: string, memberOneId: string, memberTwoId: string) {
  const res = await fetch(`${API_URL}/conversations/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ memberOneId, memberTwoId })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }
  
  const data = await res.json();
  return data as ConversationWithMembersWithProfile;
}