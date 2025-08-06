// lib/syncStreak.ts
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useStreakStore } from "@/store/useStreakStore";

export const syncStreakToFirestore = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const { streak, longestStreak, lastStreakDate } = useStreakStore.getState();

  const streakRef = doc(db, "streak", user.uid);

  await setDoc(streakRef, {
    streak,
    longestStreak,
    lastStreakDate: lastStreakDate || new Date().toISOString(),
  });
};

// Call this on reconnect, app open, or after streak increment
