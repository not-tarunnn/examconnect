"use client";

import { useEffect, useState } from "react";
import { db, rtdb } from "@/lib/firebase";
import { useChatStore } from "@/store/useChatStore";
import useAuth from "@/hooks/useAuth";
import { onValue, ref } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Plus, Search, Users } from "lucide-react";

type User = {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string;
  lastActive?: number;
  lastMessageAt?: number;
  lastMessageText?: string;
  unread?: boolean;
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

function snippetChars(str: string, maxChars: number = 40): string {
  const clean = (str || "").trim();
  if (!clean) return "";
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).trimEnd() + "...";
}

const ACTIVE_WINDOW_MS = 60000; // 1 minute considered online

function formatLastActive(ts?: number, now: number = Date.now()): string {
  if (!ts) return "";
  const d = new Date(ts);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Today => h:MM AM/PM (12h)
  if (ts >= startOfToday.getTime()) {
    const hours = d.getHours();
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const mm = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours < 12 ? "AM" : "PM";
    return `${h12}:${mm} ${ampm}`;
  }

  const diffMs = Math.max(0, now - ts);
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 52) return weeks === 1 ? "online a week ago" : `online ${weeks} weeks ago`;

  const years = Math.floor(weeks / 52);
  return years === 1 ? "online a year ago" : `online ${years} years ago`;
}

export default function FandGlistMini() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<number>(Date.now());
  const { setSelectedUser, selectedUser } = useChatStore();
  const { user: currentUser } = useAuth();

  useEffect(() => {
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

          const chat = chatMap[chatId] || {};
          let latestTs = 0;
          let latestText = "";
          for (const key in chat) {
            if (key === "typing" || key === "participants" || key === "lastMessageAt") continue;
            const msg = chat[key];
            if (!msg || typeof msg !== "object") continue;
            const ts = Number(msg.timestamp) || 0;
            if (ts >= latestTs) {
              latestTs = ts;
              latestText = typeof msg.text === "string" ? msg.text : "";
            }
          }

          // determine unread: any message not sent by current user and not marked read by them
          let unread = false;
          for (const key in chat) {
            if (key === "typing" || key === "participants" || key === "lastMessageAt") continue;
            const msg = chat[key];
            if (!msg || typeof msg !== "object") continue;
            const sender = msg.sender;
            const readBy = msg.readBy || {};
            if (sender !== currentUser.uid && !readBy[currentUser.uid]) {
              unread = true;
              break;
            }
          }

          unique[otherUid] = {
            uid: otherUid,
            username: data.username || "",
            fullName: data.fullName || data.username || otherUid,
            profilePic: data.profilePic || "",
            lastActive: data.lastActive?.toMillis ? data.lastActive.toMillis() : 0,
            lastMessageAt: chat?.lastMessageAt || latestTs || 0,
            lastMessageText: latestText,
            unread,
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

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="p-4 overflow-y-auto border-r border-white/5 min-h-scree ">
      {/* Search */}
      <motion.div
        className="flex items-center gap-3 px-1 mb-4 rounded-2xl p-2 "
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends, groups..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-zinc-100 placeholder-zinc-400"
          />
        </div>
        <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
          <Users size={18} />
        </button>
      </motion.div>

      {/* People list (Friends section) */}
      <div>
        <h3 className="text-[11px] tracking-wide font-medium text-zinc-400 uppercase mb-2 px-1">
          Friends
        </h3>
        <div className="space-y-2">
          {filtered.map((user, idx) => {
            const isActive = user.lastActive ? now - user.lastActive < ACTIVE_WINDOW_MS : false;
            const hasImage = Boolean(user.profilePic && user.profilePic.trim());
            const bg = colorForKey(user.uid || user.username);
            const initial = initialOf(user.fullName || user.username);

            return (
              <motion.button
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className={`w-full relative flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 ${
                  selectedUser?.uid === user.uid
                    ? "bg-indigo-500/15 ring-1 ring-indigo-400/30"
                    : ""
                }`}
              >
                <div className="relative shrink-0">
                  {hasImage ? (
                    <img
                      src={user.profilePic}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white font-semibold`}
                    >
                      {initial}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 ${
                      isActive ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-white text-sm">
                      {user.fullName}
                    </p>
                    <span className="text-[11px] text-zinc-400">
                      {formatLastActive(user.lastActive, now)}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-400 truncate inline-block max-w-[85%]">
                    {user.lastMessageText?.trim()
                      ? snippetChars(user.lastMessageText)
                      : `@${user.username}`}
                  </p>
                </div>

                {user.unread && (
                  <span className="absolute z-10 bottom-5 right-3 h-2 w-2 rounded-full bg-red-500 shadow-sm border border-white/10" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
