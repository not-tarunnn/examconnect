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
  checkStreakExpiry: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      streak: 0,
      longestStreak: 0,
      lastStreakDate: null,

      incrementStreak: (currentDate: string) => {
        const state = get();

        // Check if the streak expired before incrementing
        const lastDate = state.lastStreakDate ? new Date(state.lastStreakDate) : null;
        const now = new Date(currentDate);

        if (lastDate) {
          const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
          if (diffHours > 24) {
            // If expired, reset and start from 1
            set({
              streak: 1,
              longestStreak: Math.max(1, state.longestStreak),
              lastStreakDate: currentDate,
            });
            return;
          }
        }

        // Otherwise, continue the streak
        const newStreak = state.streak + 1;
        set({
          streak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          lastStreakDate: currentDate,
        });
      },

      resetStreak: () =>
        set({
          streak: 0,
          longestStreak: 0,
          lastStreakDate: null,
        }),

      setLastStreakDate: (date: string) => set({ lastStreakDate: date }),

      setStreaksFromFirestore: (streak, longest, date) =>
        set({
          streak,
          longestStreak: longest,
          lastStreakDate: date,
        }),

      checkStreakExpiry: () => {
        const state = get();
        if (!state.lastStreakDate) return;

        const lastDate = new Date(state.lastStreakDate);
        const now = new Date();
        const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

        if (diffHours > 24) {
          set({
            streak: 0,
            lastStreakDate: null,
          });
        }
      },
    }),
    {
      name: "streak-storage", // localStorage key
    }
  )
);
