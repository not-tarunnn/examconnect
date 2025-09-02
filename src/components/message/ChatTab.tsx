"use client";

import { useEffect, useRef, useState } from "react";
import { rtdb, db } from "@/lib/firebase"; // ✅ RTDB + Firestore
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
import { ScrollArea } from "@/components/ui/scroll-area"; // adjust import if needed

export default function ChatTab() {
    
  const { user } = useAuth(); // always called
  const { selectedUser } = useChatStore(); // always called

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

  const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

  const chatId = user?.uid && selectedUser?.uid
    ? user.uid < selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`
    : null;

  const typingRef = user && chatId ? ref(rtdb, `messages/${chatId}/typing/${user.uid}`) : null;
  const otherTypingRef = selectedUser && chatId ? ref(rtdb, `messages/${chatId}/typing/${selectedUser.uid}`) : null;

useEffect(() => {
  if (!chatId) return;

  const messagesRef = ref(rtdb, `messages/${chatId}`);

  // ✅ Clear previous messages before loading new ones
  setMessages([]); // 👈 this is key!

  // Ensure participants exist for listing
  if (user && selectedUser) {
    set(ref(rtdb, `messages/${chatId}/participants/${user.uid}`), true).catch(() => {});
    set(ref(rtdb, `messages/${chatId}/participants/${selectedUser.uid}`), true).catch(() => {});
  }

  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    if (snapshot.key === "typing" || snapshot.key === "participants" || snapshot.key === "lastMessageAt") return; // ignore meta
    setMessages((prev) => [...prev, snapshot.val()]);
  });

  return () => unsubscribe();
}, [chatId, user?.uid, selectedUser?.uid]);


  useEffect(() => {
    if (!otherTypingRef) return;
    const unsubscribeTyping = onValue(otherTypingRef, (snapshot) => {
      setOtherTyping(Boolean(snapshot.val()));
    });
    return () => unsubscribeTyping();
  }, [otherTypingRef]);

  // Ensure typing flag is cleared when tab is hidden/blurred or component unmounts
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

  // Debounced typing state: set once, refresh timer, clear after idle
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

  // Track presence (lastActive) for both users from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data: any = snap.data();
      setLastActiveSelf(data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0);
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedUser?.uid) return;
    const unsub = onSnapshot(doc(db, "users", selectedUser.uid), (snap) => {
      const data: any = snap.data();
      setLastActiveOther(data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0);
    });
    return () => unsub();
  }, [selectedUser?.uid]);

  // Tick clock for comparisons
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  // Cleanup messages if either user has been offline > 10 minutes (preserve metadata)
  useEffect(() => {
    if (!chatId) return;
    if (!lastActiveSelf && !lastActiveOther) return;
    const selfOffline = lastActiveSelf ? now - lastActiveSelf > OFFLINE_THRESHOLD_MS : false;
    const otherOffline = lastActiveOther ? now - lastActiveOther > OFFLINE_THRESHOLD_MS : false;
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
          if (participantsSnap.exists()) updates["participants"] = participantsSnap.val();
          if (lastAtSnap.exists()) updates["lastMessageAt"] = lastAtSnap.val();
          if (Object.keys(updates).length) await update(ref(rtdb, `messages/${chatId}`), updates);
          setMessages([]);
        } catch (_) {}
      };
      void doCleanup();
    } else {
      cleanedRef.current = false;
    }
  }, [now, lastActiveSelf, lastActiveOther, chatId]);

  // Cleanup any legacy typing path outside messages/{chatId}
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
    });
    update(messagesRef, { lastMessageAt: Date.now() }).catch(() => {});
    set(ref(rtdb, `messages/${chatId}/participants/${user.uid}`), true).catch(() => {});
    set(ref(rtdb, `messages/${chatId}/participants/${selectedUser.uid}`), true).catch(() => {});
    if (typingRef) {
      remove(typingRef);
      typingSetRef.current = false;
    }
    setInput("");
  };

  // ✅ All hooks declared above. Now we can safely conditionally render.
  if (!user || !selectedUser) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Select a user to start chatting.
      </div>
    );
  }

   return (
    <div className="flex flex-col h-full overflow-hidden">
 <ChatHeader user={selectedUser} currentUserId={user.uid} />


  {/* Message area should scroll, nothing else */}
  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`p-2 rounded-lg max-w-xs ${
          msg.sender === user.uid
            ? "bg-blue-600 ml-auto text-white"
            : "bg-gray-700 text-white"
        }`}
      >
        {msg.text}
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>

  {/* Typing indicator (pinned above input) */}
  {otherTyping && (
    <div className="px-4 pb-1">
      <div className="inline-flex items-center gap-2 text-xs text-gray-300 bg-[#202020] border border-gray-700 rounded-full px-3 py-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
        </span>
        <span>Typing…</span>
      </div>
    </div>
  )}

  {/* Input area stays pinned */}
  <div className="p-4 flex gap-2 border-t border-gray-800">
    <input
      type="text"
      className="flex-1 bg-[#202020] border border-gray-700 rounded px-3 py-2 focus:outline-none text-white"
      placeholder="Type a message..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
    />
    <button
      onClick={sendMessage}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Send
    </button>
  </div>
</div>

  );
}
