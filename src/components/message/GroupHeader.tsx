"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { doc, onSnapshot } from "firebase/firestore";
import { rtdb, db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Plus } from 'lucide-react';
import { useChatStore } from "@/store/useChatStore";

type Props = {
  groupId: string;
  name: string;
  iconBase64?: string | null;
  iconMime?: string | null;
  onInfoAction?: () => void;
  onAddAction?: () => void;
};

export default function GroupHeader({ groupId, name, iconBase64, iconMime, onInfoAction, onAddAction }: Props) {
  const [memberUids, setMemberUids] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    const membersRef = ref(rtdb, `chats/${groupId}/members`);
    const unsub = onValue(membersRef, (snap) => {
      const members = snap.val() || {};
      setMemberUids(Object.keys(members));
    });
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    if (!memberUids.length) {
      setOnlineCount(0);
      return;
    }
    const unsubs: Array<() => void> = [];
    let active = 0;
    const now = Date.now();
    const ACTIVE_WINDOW_MS = 60000;
    memberUids.forEach((uid) => {
      const u = onSnapshot(
        doc(db, "users", uid),
        (snap) => {
          const data: any = snap.data();
          const ts = data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0;
          const isActive = ts ? now - ts < ACTIVE_WINDOW_MS : false;
          active += isActive ? 1 : 0;
          setOnlineCount((prev) => {
            // we can't reliably increment without tracking each user; recompute below instead
            return prev; 
          });
        },
        () => {}
      );
      unsubs.push(() => u());
    });

    // periodic recompute of online count
    const recompute = () => {
      let count = 0;
      const now2 = Date.now();
      const promises = memberUids.map((uid) =>
        new Promise<void>((resolve) => {
          const u = onSnapshot(
            doc(db, "users", uid),
            (snap) => {
              const data: any = snap.data();
              const ts = data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0;
              if (ts && now2 - ts < ACTIVE_WINDOW_MS) count += 1;
              resolve();
            },
            () => resolve()
          );
          setTimeout(() => u(), 0);
        })
      );
      Promise.all(promises).then(() => setOnlineCount(count));
    };
    const timer = setInterval(recompute, 30000);
    recompute();

    return () => {
      unsubs.forEach((fn) => fn());
      clearInterval(timer);
    };
  }, [memberUids]);
const { selectedUser, setSelectedUser: rawSetSelectedUser } = useChatStore();

const setSelectedUser = useCallback(
  (user: any) => rawSetSelectedUser(user),
  [rawSetSelectedUser]
);
  const handleBack = () => setSelectedUser(null);
  const imgSrc = useMemo(() => {
    if (!iconBase64) return null;
    const mime = iconMime || "image/png";
    return `data:${mime};base64,${iconBase64}`;
  }, [iconBase64, iconMime]);

  return (
    <motion.header
      className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-2xl"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3">
           {/* Back button */}
    <button
      onClick={handleBack}
     className="text-white p-1 rounded-lg hover:bg-white/10 flex items-center justify-center md:hidden"

    >
      <ArrowLeft size={22} />
    </button>
        <div className="relative">
          {imgSrc ? (
            <img src={imgSrc} alt={name} className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow-sm" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center border border-white/10 shadow-sm font-semibold">
              {name?.charAt(0)?.toUpperCase() || "G"}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{name}</div>
          <div className="text-[11px] text-zinc-400">
            {memberUids.length} members{onlineCount ? ` • ${onlineCount} online` : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onAddAction && onAddAction()} className="p-2 rounded-xl hover:bg-white/10 border border-white/10" aria-label="Add members">
          <Plus size={18} color="currentColor" strokeWidth={2} />
        </button>
        <button onClick={() => onInfoAction && onInfoAction()} className="p-2 rounded-xl hover:bg-white/10 border border-white/10" aria-label="Group info">
          <Info size={18} color="currentColor" strokeWidth={2} />
        </button>
      </div>
    </motion.header>
  );
}
