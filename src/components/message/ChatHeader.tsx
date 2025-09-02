"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatHeaderProps {
  user: {
    fullName: string;
    username: string;
    profilePic?: string;
    uid: string;
  };
  currentUserId: string;
}

const ACTIVE_WINDOW_MS = 60000;

export default function ChatHeader({ user }: ChatHeaderProps) {
  const [lastActive, setLastActive] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data: any = snap.data();
        setLastActive(data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0);
      },
      (error) => {
        console.warn("ChatHeader presence error:", error?.message || error);
        setLastActive(0);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  const isActive = lastActive ? now - lastActive < ACTIVE_WINDOW_MS : false;

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-[#181818]">
      <div className="relative">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 ${
            isActive ? "bg-green-500" : "bg-gray-500"
          }`}
          aria-label={isActive ? "Online" : "Offline"}
        />
      </div>
      <div>
        <p className="font-medium text-white">{user.fullName}</p>
        <p className="text-sm text-gray-400">@{user.username}</p>
      </div>
    </div>
  );
}
