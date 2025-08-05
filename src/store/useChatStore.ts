// store/useChatStore.ts
import { create } from "zustand";

interface SelectedUser {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string;
}

interface ChatStore {
  selectedUser: SelectedUser | null;
  setSelectedUser: (user: SelectedUser) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
