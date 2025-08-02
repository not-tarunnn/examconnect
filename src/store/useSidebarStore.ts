import { create } from 'zustand';

type SidebarStore = {
  collapsed: boolean;
  toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  toggle: () =>
    set((state) => {
      const next = !state.collapsed;
      localStorage.setItem("sidebar-collapsed", String(next)); // optional
      return { collapsed: next };
    }),
}));
