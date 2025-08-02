// /store/useOnboardingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
  username: string;
  fullName: string;
  gender: string;
  dob: string;
  bio: string;
  profilePic: string | null;
  classLevel: string;
  targetExam: string;
  chronotype: string;
  avgSleepTime: number | null;
  agreed?: boolean; // ✅ can be undefined
  setField: (field: keyof OnboardingState, value: any) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      username: "",
      fullName: "",
      gender: "",
      dob: "",
      bio: "",
      profilePic: null,
      classLevel: "",
      targetExam: "",
      chronotype: "",
      avgSleepTime: null,
      agreed: undefined, // ✅ explicitly undefined (optional)
      setField: (field, value) => set({ [field]: value }),
      reset: () =>
        set({
          username: "",
          fullName: "",
          gender: "",
          dob: "",
          bio: "",
          profilePic: null,
          classLevel: "",
          targetExam: "",
          chronotype: "",
          avgSleepTime: null,
          agreed: undefined, // ✅ reset to undefined
        }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
