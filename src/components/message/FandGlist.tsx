"use client";

import { useEffect, useState } from "react";
import { db, rtdb } from "@/lib/firebase";
import { useChatStore } from "@/store/useChatStore";
import useAuth from "@/hooks/useAuth";
import { onValue, ref } from "firebase/database";

import { doc, getDoc } from "firebase/firestore";

type User = {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string;
  lastActive?: number; // millis
  lastMessageAt?: number;
};

function colorForKey(key: string) {
  const palette = [
    "bg-rose-500","bg-orange-500","bg-amber-500","bg-lime-500","bg-emerald-500",
    "bg-teal-500","bg-sky-500","bg-indigo-500","bg-violet-500","bg-fuchsia-500",
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  const idx = Math.abs(hash) % palette.length;
  return palette[idx];
}

function initialOf(name?: string) {
  const n = (name || "?").trim();
  return n ? n.charAt(0).toUpperCase() : "?";
}

const ACTIVE_WINDOW_MS = 60000; // 1 minute considered online

export default function FandGlist() {
  const [users, setUsers] = useState<User[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const { setSelectedUser } = useChatStore();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // tick to re-evaluate online status thresholds
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const messagesRoot = ref(rtdb, `messages`);

    const load = async (chatMap: Record<string, any>) => {
      const mine = Object.keys(chatMap || {}).filter((chatId) => chatId.includes(currentUser.uid));
      const unique: Record<string, User> = {};
      await Promise.all(
        mine.map(async (chatId) => {
          const [a, b] = chatId.split("_");
          const otherUid = a === currentUser.uid ? b : a;
          if (!otherUid) return;
          const userSnap = await getDoc(doc(db, "users", otherUid));
          if (!userSnap.exists()) return;
          const data: any = userSnap.data();
          unique[otherUid] = {
            uid: otherUid,
            username: data.username || "",
            fullName: data.fullName || data.username || otherUid,
            profilePic: data.profilePic || "",
            lastActive: data.lastActive?.toMillis ? data.lastActive.toMillis() : 0,
            lastMessageAt: chatMap[chatId]?.lastMessageAt || 0,
          };
        })
      );
      const list = Object.values(unique).sort((x, y) => (y.lastMessageAt || 0) - (x.lastMessageAt || 0));
      setUsers(list);
    };

    const unsub = onValue(messagesRoot, (snap) => {
      load((snap.val() as any) || {});
    });

    return () => unsub();
  }, [currentUser?.uid]);

  return (
    <div className="p-8 pt-5 space-y-5 min-h-screen overflow-y-auto">
      <h1 className="text-xl font-bold tracking-tight">EXAM CONNECT</h1>
      <h2 className="text-lg font-semibold text-gray-300">People</h2>

      {users.map((user) => {
        const isActive = user.lastActive ? now - user.lastActive < ACTIVE_WINDOW_MS : false;
        const hasImage = Boolean(user.profilePic && user.profilePic.trim());
        const bg = colorForKey(user.uid || user.username);
        const initial = initialOf(user.fullName || user.username);
        return (
          <div
            key={user.uid}
            onClick={() => setSelectedUser(user)}
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-800 rounded transition"
          >
            <div className="relative">
              {hasImage ? (
                <img
                  src={user.profilePic as string}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white font-semibold`}>
                  {initial}
                </div>
              )}
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
      })}
    </div>
  );
}
