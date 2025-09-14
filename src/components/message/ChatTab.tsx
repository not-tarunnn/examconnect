"use client";

import { useEffect, useRef, useState } from "react";
import { rtdb, db } from "@/lib/firebase";
import {
  onChildAdded,
  push,
  ref,
  set,
  onValue,
  remove,
  get,
  update,
} from "firebase/database";
import { doc, onSnapshot } from "firebase/firestore";
import ChatHeader from "./ChatHeader";
import { useChatStore } from "@/store/useChatStore";
import useAuth from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Send } from "lucide-react";
import AttachmentPicker from "@/components/message/AttachmentPicker";

export default function ChatTab() {
  const { user } = useAuth();
  const { selectedUser } = useChatStore();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingSetRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanedRef = useRef(false);

  const [lastActiveSelf, setLastActiveSelf] = useState<number>(0);
  const [lastActiveOther, setLastActiveOther] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  const OFFLINE_THRESHOLD_MS = Number.POSITIVE_INFINITY;

  const chatId =
    user?.uid && selectedUser?.uid
      ? user.uid < selectedUser.uid
        ? `${user.uid}_${selectedUser.uid}`
        : `${selectedUser.uid}_${user.uid}`
      : null;

  const typingRef =
    user && chatId ? ref(rtdb, `messages/${chatId}/typing/${user.uid}`) : null;
  const otherTypingRef =
    selectedUser && chatId
      ? ref(rtdb, `messages/${chatId}/typing/${selectedUser.uid}`)
      : null;

  // --- logic kept exactly the same ---
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = ref(rtdb, `messages/${chatId}`);
    setMessages([]);
    if (user && selectedUser) {
      set(ref(rtdb, `messages/${chatId}/participants/${user.uid}`), true).catch(
        () => {}
      );
      set(
        ref(rtdb, `messages/${chatId}/participants/${selectedUser.uid}`),
        true
      ).catch(() => {});
    }
    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      if (
        snapshot.key === "typing" ||
        snapshot.key === "participants" ||
        snapshot.key === "lastMessageAt"
      )
        return;
      setMessages((prev) => [...prev, snapshot.val()]);
    });
    return () => unsubscribe();
  }, [chatId, user?.uid, selectedUser?.uid]);

  // Mark all messages in this chat as read by current user when opening the chat
  useEffect(() => {
    if (!chatId || !user?.uid) return;
    const markRead = async () => {
      try {
        const snap = await get(ref(rtdb, `messages/${chatId}`));
        if (!snap.exists()) return;
        const updates: any = {};
        snap.forEach((child) => {
          const key = child.key;
          if (!key) return;
          if (key === "typing" || key === "participants" || key === "lastMessageAt") return;
          const val = child.val() || {};
          if (val.readBy && val.readBy[user.uid]) return;
          updates[`messages/${chatId}/${key}/readBy/${user.uid}`] = true;
        });
        if (Object.keys(updates).length) {
          await update(ref(rtdb), updates);
        }
      } catch (err) {}
    };
    void markRead();
  }, [chatId, user?.uid]);

  useEffect(() => {
    if (!otherTypingRef) return;
    const unsubscribeTyping = onValue(otherTypingRef, (snapshot) => {
      setOtherTyping(Boolean(snapshot.val()));
    });
    return () => unsubscribeTyping();
  }, [otherTypingRef]);

  useEffect(() => {
    if (!typingRef) return;
    const clearTyping = () => {
      typingSetRef.current = false;
      remove(typingRef);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") clearTyping();
    };
    window.addEventListener("blur", clearTyping);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", clearTyping);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTyping();
    };
  }, [typingRef]);

  useEffect(() => {
    if (!typingRef) return;
    const ensureRemove = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      remove(typingRef);
      typingSetRef.current = false;
    };
    if (input.length > 0) {
      if (!typingSetRef.current) {
        set(typingRef, true).catch(() => {});
        typingSetRef.current = true;
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(ensureRemove, 2000);
    } else {
      ensureRemove();
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [input, typingRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data: any = snap.data();
      setLastActiveSelf(
        data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0
      );
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedUser?.uid) return;
    const unsub = onSnapshot(doc(db, "users", selectedUser.uid), (snap) => {
      const data: any = snap.data();
      setLastActiveOther(
        data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0
      );
    });
    return () => unsub();
  }, [selectedUser?.uid]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!chatId) return;
    if (!lastActiveSelf && !lastActiveOther) return;
    const selfOffline = lastActiveSelf
      ? now - lastActiveSelf > OFFLINE_THRESHOLD_MS
      : false;
    const otherOffline = lastActiveOther
      ? now - lastActiveOther > OFFLINE_THRESHOLD_MS
      : false;
    if (selfOffline || otherOffline) {
      if (cleanedRef.current) return;
      cleanedRef.current = true;
      const doCleanup = async () => {
        try {
          const [typingSnap, participantsSnap, lastAtSnap] = await Promise.all([
            get(ref(rtdb, `messages/${chatId}/typing`)),
            get(ref(rtdb, `messages/${chatId}/participants`)),
            get(ref(rtdb, `messages/${chatId}/lastMessageAt`)),
          ]);
          await remove(ref(rtdb, `messages/${chatId}`));
          const updates: any = {};
          if (typingSnap.exists()) updates["typing"] = typingSnap.val();
          if (participantsSnap.exists()) updates["participants"] =
            participantsSnap.val();
          if (lastAtSnap.exists()) updates["lastMessageAt"] = lastAtSnap.val();
          if (Object.keys(updates).length)
            await update(ref(rtdb, `messages/${chatId}`), updates);
          setMessages([]);
        } catch (_) {}
      };
      void doCleanup();
    } else {
      cleanedRef.current = false;
    }
  }, [now, lastActiveSelf, lastActiveOther, chatId]);

  useEffect(() => {
    if (!chatId || !user) return;
    remove(ref(rtdb, `typing/${chatId}/${user.uid}`)).catch(() => {});
  }, [chatId, user?.uid]);

  const sendMessage = () => {
    if (!input.trim() || !chatId || !user || !selectedUser) return;
    const messagesRef = ref(rtdb, `messages/${chatId}`);
    push(messagesRef, {
      text: input,
      sender: user.uid,
      timestamp: Date.now(),
      readBy: { [user.uid]: true },
    });
    update(messagesRef, { lastMessageAt: Date.now() }).catch(() => {});
    set(ref(rtdb, `messages/${chatId}/participants/${user.uid}`), true).catch(
      () => {}
    );
    set(
      ref(rtdb, `messages/${chatId}/participants/${selectedUser.uid}`),
      true
    ).catch(() => {});
    if (typingRef) {
      remove(typingRef);
      typingSetRef.current = false;
    }
    setInput("");
  };

  if (!user || !selectedUser) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Select a user to start chatting.
      </div>
    );
  }

  // --- UI merged from modern version ---
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#121212] relative">
      <ChatHeader user={selectedUser} currentUserId={user.uid} />

      {/* Messages */}
<div className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
  <AnimatePresence>
    {messages.map((msg, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className={`flex ${msg.sender === user.uid ? "justify-end" : "justify-start"}`}
      >
        {msg && msg.data && msg.mime ? (
          <img
            src={`data:${msg.mime};base64,${msg.data}`}
            alt={msg.filename || "image"}
            className="rounded-md max-w-[70%] h-auto"
          />
        ) : (
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm text-sm break-words inline-block max-w-[70%] ${
              msg.sender === user.uid
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-[#1e1e1e] text-gray-200 rounded-bl-md"
            }`}
          >
            {msg.text}
          </div>
        )}
      </motion.div>
    ))}
  </AnimatePresence>
  <div ref={messagesEndRef} />
</div>



      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[min(900px,92%)] max-w-3xl pointer-events-auto">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="mx-auto"
          >
            <div className="relative">
              <AnimatePresence>
                {otherTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute -top-8 left-4"
                  >
                    <div className="inline-flex items-center gap-2 text-xs text-gray-300 bg-[#202020]/70 border border-gray-700 rounded-full px-3 py-1 backdrop-blur">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                      </span>
                      <span>Typing…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border border-white/10 bg-transparent backdrop-blur-3xl">
                <button aria-label="Emoji" className="p-1 rounded-full hover:bg-white/5">
                  <Smile size={18} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Message"
                  className="flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-400 text-sm"
                />
                <AttachmentPicker onUploadAction={async (base64: string, mime: string, filename: string) => {
                  try {
                    if (!chatId || !user || !selectedUser) return;
                    const messagesRef = ref(rtdb, `messages/${chatId}`);
                    await push(messagesRef, {
                      image: true,
                      data: base64,
                      mime,
                      filename,
                      sender: user.uid,
                      timestamp: Date.now(),
                      readBy: { [user.uid]: true },
                    });
                    update(messagesRef, { lastMessageAt: Date.now() }).catch(() => {});
                    set(ref(rtdb, `messages/${chatId}/participants/${user.uid}`), true).catch(() => {});
                    set(ref(rtdb, `messages/${chatId}/participants/${selectedUser.uid}`), true).catch(() => {});
                  } catch (_) {}
                }} />
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={sendMessage}
                  aria-label="Send"
                  className="ml-2 hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                >
                  <Send size={14} />
                  <span>Send</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
