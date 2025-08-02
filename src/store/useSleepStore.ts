import { create } from 'zustand';

interface SleepStore {
  accessToken: string | null;
  sleepHours: number | null;
  setAccessToken: (token: string | null) => void; // allow null
  setSleepHours: (hours: number | null) => void;  // allow null
  clear: () => void;
}

const useSleepStore = create<SleepStore>((set) => ({
  accessToken: null,
  sleepHours: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setSleepHours: (hours) => set({ sleepHours: hours }),
  clear: () => set({ accessToken: null, sleepHours: null }),
}));

export default useSleepStore;
