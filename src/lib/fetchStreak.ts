import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useStreakStore } from "@/store/useStreakStore";

export const fetchStreakFromFirestore = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const streakRef = doc(db, "streak", user.uid);
  const snap = await getDoc(streakRef);

  if (snap.exists()) {
    const data = snap.data();
    useStreakStore.getState().setStreaksFromFirestore(
      data.streak,
      data.longestStreak,
      data.lastStreakDate
    );
  }
};
