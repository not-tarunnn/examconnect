"use client";

import { useEffect } from "react";
import { messaging, } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

export default function AutoNotification() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const requestPermission = async () => {
      // Avoid requesting if already granted
      if (Notification.permission === "granted") return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });

      if (token) {
        await setDoc(
          doc(db, "users", user.uid),
          { fcmToken: token },
          { merge: true }
        );
      }

      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener("scroll", requestPermission);
      window.removeEventListener("touchstart", requestPermission);
      window.removeEventListener("click", requestPermission);
    };

    // Add all interaction listeners
    window.addEventListener("scroll", requestPermission, { once: true });
    window.addEventListener("touchstart", requestPermission, { once: true });
    window.addEventListener("click", requestPermission, { once: true });

    return removeListeners;
  }, [user]);

  return null;
}
