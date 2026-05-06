"use client";

import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
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

  // Handle foreground notifications
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const { notification, data } = payload;

      if (notification) {
        // Show notification in the foreground
        const notificationOptions: NotificationOptions = {
          body: notification.body || "",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "message-notification",
          data: data || {},
        };

        // Create notification
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(notification.title || "New Message", notificationOptions);
          });
        } else {
          // Fallback: create a browser notification if service worker not available
          new Notification(notification.title || "New Message", notificationOptions);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
