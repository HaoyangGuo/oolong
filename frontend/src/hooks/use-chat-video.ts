import { create } from "zustand";

interface ChatVideoStore {
  isVideoOpen: boolean;
  toggleVideo: () => void;
}

export const useChatVideo = create<ChatVideoStore>((set) => {
  return {
    isVideoOpen: false,
    toggleVideo: () => set((state) => ({ isVideoOpen: !state.isVideoOpen })),
  };
});
