import {
  ChannelType,
  MemberRole,
  Profile,
  Server,
  ServerWithChannels,
  ServerWithChannelsWithMembersWithProfiles,
} from "@/models";
import { ApiError } from "@/utils";

const API_URL = import.meta.env.VITE_API_URL;

export const getDefaultServer = async (accessToken: string) => {
  const res = await fetch(`${API_URL}/servers/default`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new ApiError(res.status, res.statusText);

  // Check if the response has a JSON content type
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    return data as ServerWithChannels;
  } else {
    // No JSON content found in the body, return null or any default value you want
    return null;
  }
};

export const getServers = async (accessToken: string) => {
  const res = await fetch(`${API_URL}/servers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as ServerWithChannels[];
};

export const getServer = async (accessToken: string, serverId: string) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}`,
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
  return data as ServerWithChannelsWithMembersWithProfiles;
};

export const createServer = async (
  accessToken: string,
  createServerFormData: FormData
) => {
  const res = await fetch(`${API_URL}/servers/create`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: createServerFormData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};

export const editServer = async (
  accessToken: string,
  serverId: string,
  editServerFormData: FormData
) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
      body: editServerFormData,
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};

export const joinServer = async (accessToken: string, inviteCode: string) => {
  const res = await fetch(
    `${API_URL}/servers/join/${inviteCode}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as ServerWithChannels;
};

export const updateInviteCode = async (
  accessToken: string,
  serverId: string
) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}/invite-code`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};

export const updateMemberRole = async (
  accessToken: string,
  serverId: string,
  memberId: string,
  role: MemberRole
) => {
  const res = await fetch(
    `${
      API_URL
    }/servers/${serverId}/members/${memberId}/role`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({ role: role }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Profile;
};

export const kickMember = async (
  accessToken: string,
  serverId: string,
  memberId: string
) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}/members/${memberId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Profile;
};

export const leaveServer = async (accessToken: string, serverId: string) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}/members/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};

export const deleteServer = async (accessToken: string, serverId: string) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};

export const deleteChannel = async (
  accessToken: string,
  channelId: string,
  serverId: string
) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}/channels/${channelId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};

export const editChannel = async (
  accessToken: string,
  channelId: string,
  serverId: string,
  name: string,
  type: ChannelType
) => {
  const res = await fetch(
    `${API_URL}/servers/${serverId}/channels/${channelId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({ name: name, type: type }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Server;
};
