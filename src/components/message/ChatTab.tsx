"use client";

import { useEffect, useRef, useState } from "react";
import { rtdb } from "@/lib/firebase"; // ✅ RTDB instance
import {
  onChildAdded,
  push,
  ref,
  set,
  onValue,
  remove,
} from "firebase/database";
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

  const chatId = user?.uid && selectedUser?.uid
    ? user.uid < selectedUser.uid
      ? `${user.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${user.uid}`
    : null;

  const typingRef = user && chatId ? ref(rtdb, `typing/${chatId}/${user.uid}`) : null;
  const otherTypingRef = selectedUser && chatId ? ref(rtdb, `typing/${chatId}/${selectedUser.uid}`) : null;

useEffect(() => {
  if (!chatId) return;

  const messagesRef = ref(rtdb, `messages/${chatId}`);

  // ✅ Clear previous messages before loading new ones
  setMessages([]); // 👈 this is key!

  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    setMessages((prev) => [...prev, snapshot.val()]);
  });

  return () => unsubscribe();
}, [chatId]);


  useEffect(() => {
    if (!otherTypingRef) return;
    const unsubscribeTyping = onValue(otherTypingRef, (snapshot) => {
      setOtherTyping(snapshot.val() === true);
    });
    return () => unsubscribeTyping();
  }, [otherTypingRef]);

  useEffect(() => {
    if (!typingRef) return;
    if (input.length > 0) {
      set(typingRef, true);
    } else {
      remove(typingRef);
    }
    const timeout = setTimeout(() => remove(typingRef), 2000);
    return () => clearTimeout(timeout);
  }, [input, typingRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !chatId || !user) return;
    const messagesRef = ref(rtdb, `messages/${chatId}`);
    push(messagesRef, {
      text: input,
      sender: user.uid,
      timestamp: Date.now(),
    });
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

  {/* Typing indicator (optional, not scrollable) */}
  {otherTyping && (
    <div className="text-sm text-gray-400 px-4 pb-1">Typing...</div>
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