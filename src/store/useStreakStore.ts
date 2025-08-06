// hooks/useStreakStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StreakState {
  streak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  incrementStreak: (currentDate: string) => void;
  resetStreak: () => void;
  setLastStreakDate: (date: string) => void;
  setStreaksFromFirestore: (streak: number, longest: number, date: string) => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set) => ({
      streak: 0,
      longestStreak: 0,
      lastStreakDate: null,

      incrementStreak: (currentDate: string) =>
        set((state) => {
          const newStreak = state.streak + 1;
          return {
            streak: newStreak,
            longestStreak: Math.max(newStreak, state.longestStreak),
            lastStreakDate: currentDate,
          };
        }),

      resetStreak: () =>
        set({
          streak: 0,
          longestStreak: 0, // ✅ reset this too
          lastStreakDate: null,
        }),

      setLastStreakDate: (date: string) => set({ lastStreakDate: date }),

      setStreaksFromFirestore: (streak, longest, date) =>
        set({
          streak,
          longestStreak: longest,
          lastStreakDate: date,
        }),
    }),
    {
      name: "streak-storage", // localStorage key
    }
  )
);
