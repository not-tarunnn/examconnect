export const registerFcmSW = async () => {
  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("FCM Service Worker registered successfully");
    } catch (err) {
      console.error("FCM SW registration failed:", err);
    }
  }
};
