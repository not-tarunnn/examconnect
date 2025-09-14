"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Camera, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ChatHeaderProps {
  user: {
    fullName: string;
    profilePic?: string;
    uid: string;
    username?: string;
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

  function formatLastSeen() {
    if (!lastActive) return "Offline";
    const diff = now - lastActive;
    if (diff < 60000) return "Active now";
    if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `Active ${Math.floor(diff / 3600000)}h ago`;
    return "Inactive";
  }

  return (
    <motion.header
      className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-2xl"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {user.username ? (
            <Link href={`/profile/${encodeURIComponent(user.username)}`} aria-label={user.fullName} className="block">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow-sm"
              />
            </Link>
          ) : (
            <img
              src={user.profilePic || "/avatar.png"}
              alt={user.fullName}
              className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow-sm"
            />
          )}
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#181818] ${
              isActive ? "bg-green-500" : "bg-gray-500"
            }`}
            aria-label={isActive ? "Online" : "Offline"}
          />
        </div>
        <div>
          {user.username ? (
            <Link href={`/profile/${encodeURIComponent(user.username)}`} className="text-sm font-semibold text-white no-underline hover:no-underline">
              {user.fullName}
            </Link>
          ) : (
            <div className="text-sm font-semibold text-white">{user.fullName}</div>
          )}
          <div className="text-[11px] text-zinc-400">{formatLastSeen()}</div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-white/10 border border-white/10">
          <Camera size={16} />
        </button>
        <button className="p-2 rounded-xl hover:bg-white/10 border border-white/10">
          <MoreVertical size={16} />
        </button>
      </div>
    </motion.header>
  );
}
