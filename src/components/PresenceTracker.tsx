"use client";

import { useEffect, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";

const HEARTBEAT_MS = 30000; // send heartbeat every 30s when active
const ACTIVE_WINDOW_MS = 60000; // consider "really active" if interacted within last 60s

export default function PresenceTracker() {
  const { user } = useAuth();
  const lastInteractionRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);

    const markActive = async () => {
      try {
        await setDoc(
          userRef,
          {
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        // Best-effort; ignore errors
      }
    };

    const handleInteraction = () => {
      lastInteractionRef.current = Date.now();
    };

    const shouldHeartbeat = () => {
      if (typeof document === "undefined") return false;
      const visible = document.visibilityState === "visible";
      const recent = Date.now() - lastInteractionRef.current < ACTIVE_WINDOW_MS;
      return visible && recent;
    };

    // Initial ping on mount/focus
    markActive();

    // Heartbeat loop
    intervalRef.current = setInterval(() => {
      if (shouldHeartbeat()) {
        markActive();
      }
    }, HEARTBEAT_MS);

    // Track interactions indicating "real" activity
    const events: (keyof DocumentEventMap | keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
      "focus",
      "visibilitychange",
    ];

    events.forEach((evt) => {
      // @ts-ignore - add both to window and document to catch most cases
      (window as any).addEventListener?.(evt, handleInteraction, { passive: true });
      // @ts-ignore
      (document as any).addEventListener?.(evt, handleInteraction, { passive: true });
    });

    // Update lastActive when tab regains focus immediately
    const onFocus = () => markActive();
    window.addEventListener("focus", onFocus);

    // Best-effort update on unload
    const onBeforeUnload = () => {
      void markActive();
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      events.forEach((evt) => {
        // @ts-ignore
        (window as any).removeEventListener?.(evt, handleInteraction as any);
        // @ts-ignore
        (document as any).removeEventListener?.(evt, handleInteraction as any);
      });
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [user?.uid]);

  return null;
}
