// store/useChatStore.ts
import { create } from "zustand";

interface SelectedUser {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string;
}

interface SelectedGroup {
  groupId: string;
  name: string;
  iconBase64?: string | null;
  iconMime?: string | null;
}

interface ChatStore {
  selectedUser: SelectedUser | null;
  selectedGroup: SelectedGroup | null;
  setSelectedUser: (user: SelectedUser | null) => void;
  setSelectedGroup: (group: SelectedGroup | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedUser: null,
  selectedGroup: null,
  setSelectedUser: (user) => set({ selectedUser: user, selectedGroup: null }),
  setSelectedGroup: (group) => set({ selectedGroup: group, selectedUser: null }),
}));
