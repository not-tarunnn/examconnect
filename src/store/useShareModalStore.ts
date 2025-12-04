import { create } from "zustand";

type ShareModalState = {
  open: boolean;
  groupId: string | null;
  groupName: string | null;
  openModal: (groupId: string, groupName: string) => void;
  closeModal: () => void;
};

export const useShareModalStore = create<ShareModalState>((set) => ({
  open: false,
  groupId: null,
  groupName: null,
  openModal: (groupId: string, groupName: string) =>
    set({ open: true, groupId, groupName }),
  closeModal: () => set({ open: false, groupId: null, groupName: null }),
}));
