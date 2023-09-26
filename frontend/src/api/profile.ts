import { Profile } from "@/models";
import { ApiError } from "@/utils";

const API_URL = import.meta.env.VITE_API_URL;

export const getMyProfile = async (accessToken: string) => {
  const res = await fetch(`${API_URL}/profiles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Profile;
};

export const editMyProfile = async (
  accessToken: string,
  editProfileFormData: FormData
) => {
  const res = await fetch(`${API_URL}/profiles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "PATCH",
    body: editProfileFormData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new ApiError(errorData.statusCode, errorData.message);
  }

  const data = await res.json();
  return data as Profile;
};
