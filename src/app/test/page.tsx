// DMPage_Dark_Glassmorphism_UI.tsx
// Dark theme + glassmorphism (backdrop blur), removed right details pane
// TypeScript + Tailwind + Framer Motion
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Users, Camera, MoreVertical, Send, Paperclip, Plus, Smile, Mic } from "lucide-react";
import Sidebar from "@/components/Sidebar";

// --- Types ---
type User = {
  id: string;
  name: string;
  last?: string;
  time?: string;
  unread?: number;
  color?: string;
};

type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

// --- Sample Data ---
const SAMPLE_FRIENDS: User[] = [
  { id: "u1", name: "Aarav", last: "Sent a photo", time: "11:23", unread: 2, color: "bg-indigo-500/20" },
  { id: "u2", name: "Maya", last: "Haha nice", time: "10:05", color: "bg-amber-500/20" },
  { id: "u3", name: "Rohan", last: "Let's meet", time: "Yesterday", color: "bg-emerald-500/20" },
  { id: "u4", name: "Zoya", last: "Typing...", time: "08:01", unread: 1, color: "bg-pink-500/20" },
];

const SAMPLE_GROUPS: User[] = [
  { id: "g1", name: "Design Crew", last: "New Figma file", time: "09:30", color: "bg-violet-500/20" },
  { id: "g2", name: "Family", last: "Dinner?", time: "Yesterday", color: "bg-sky-500/20" },
];

const SAMPLE_MESSAGES: Message[] = [
  { id: "m1", sender: "them", text: "Hey! You free for a quick call?", time: "11:20" },
  { id: "m2", sender: "me", text: "Yep — in 10 mins. Sharing screen.", time: "11:21" },
  { id: "m3", sender: "them", text: "Perfect. Also check the new mockup I uploaded.", time: "11:22" },
];

export default function DMPage() {
  const [friends] = useState<User[]>(SAMPLE_FRIENDS);
  const [groups] = useState<User[]>(SAMPLE_GROUPS);
  const [selected, setSelected] = useState<User | null>(SAMPLE_FRIENDS[0]);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // helper class for glass panels
  const glass = "bg-white/5 backdrop-blur-[30px] border border-white/10"; // 3xl-esque blur

  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, selected]);

  function sendMessage() {
    if (!text.trim()) return;
    const m: Message = {
      id: String(Date.now()),
      sender: "me",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((s) => [...s, m]);
    setText("");
  }

  function chooseUser(u: User) {
    setSelected(u);
    setMessages(SAMPLE_MESSAGES.map((m) => ({ ...m, id: m.id + u.id })));
  }

  const filteredFriends = friends.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-screen h-screen bg-[#202020] text-zinc-50 font-sans flex overflow-hidden">
      {/* App Sidebar (your existing component) */}
      <Sidebar />

      {/* Two-column layout: Left list + Center chat */}
      <div className="flex-1 grid md:grid-cols-[320px_1fr]">
        {/* LEFT: Friends & Groups */}
        <aside className="p-4 overflow-y-auto border-r border-white/5">
          <motion.div
            className={`mb-4 rounded-2xl px-3 py-2 `}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages</h2>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-xs"
              >
                <Plus size={14} /> New
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className={`flex items-center gap-3 px-1 mb-4  rounded-2xl p-2`}
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

          <div className="space-y-4">
            <div>
              <h3 className="text-[11px] tracking-wide font-medium text-zinc-400 uppercase mb-2 px-1">Friends</h3>
              <div className="space-y-2">
                {filteredFriends.map((f, idx) => (
                  <motion.button
                    key={f.id}
                    onClick={() => chooseUser(f)}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 ${
                      selected?.id === f.id ? "bg-indigo-500/15 ring-1 ring-indigo-400/30" : ""
                    } `}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${f.color || "bg-white/10"} text-zinc-100`}>
                      {f.name.split(" ")[0].slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">{f.name}</div>
                        <div className="text-[11px] text-zinc-400">{f.time}</div>
                      </div>
                      <div className="text-[12px] text-zinc-400 truncate">{f.last}</div>
                    </div>
                    {f.unread ? (
                      <div className="min-w-[22px] text-[11px] h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center px-2">
                        {f.unread}
                      </div>
                    ) : null}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] tracking-wide font-medium text-zinc-400 uppercase mb-2 px-1">Groups</h3>
              <div className="space-y-2">
                {groups.map((g, idx) => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 `}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${g.color || "bg-white/10"} text-zinc-100`}>
                      {g.name.split(" ")[0].slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">{g.name}</div>
                        <div className="text-[11px] text-zinc-400">{g.time}</div>
                      </div>
                      <div className="text-[12px] text-zinc-400 truncate">{g.last}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: Messages area */}
        <main className="flex-1 flex flex-col">
          <motion.header
            className={`flex items-center justify-between px-6 py-4 border-b border-white/5 ${glass}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-400/10 flex items-center justify-center text-lg font-semibold text-indigo-300">
                {selected?.name?.slice(0, 1)}
              </div>
              <div>
                <div className="text-sm font-semibold">{selected?.name}</div>
                <div className="text-[11px] text-zinc-400">Active now</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl hover:bg-white/10 border border-white/10"><Camera size={16} /></button>
              <button className="p-2 rounded-xl hover:bg-white/10 border border-white/10"><MoreVertical size={16} /></button>
            </div>
          </motion.header>

          <div className="flex-1 overflow-hidden p-6">
            <div ref={messagesRef} className="h-full overflow-auto pr-2 pb-6 flex flex-col gap-4">
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className={`max-w-[70%] ${m.sender === "me" ? "self-end" : "self-start"}`}
                  >
                    <div
                      className={`${
                        m.sender === "me"
                          ? "bg-indigo-600/90 text-white rounded-2xl rounded-br-md"
                          : "bg-white/10 text-zinc-100 rounded-2xl rounded-bl-md"
                      } px-4 py-2 shadow-lg border border-white/10`}
                    >
                      <div className="text-sm leading-relaxed">{m.text}</div>
                      <div className={`text-[10px] mt-1 ${m.sender === "me" ? "text-indigo-100/80" : "text-zinc-400"}`}>{m.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

{/* CENTERED COMPACT INPUT — positioned above bottom (Telegram style) */}
          <div className="absolute right-56 bottom-6 w-[min(900px,92%)] max-w-3xl pointer-events-auto">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="mx-auto"
              >
                <div className="relative">
                  {/* pill */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border border-white/10 bg-transparent backdrop-blur-3xl">
                    {/* left: emoji */}
                    <button aria-label="Emoji" className="p-1 rounded-full hover:bg-white/5">
                      <Smile size={18} />
                    </button>

                    {/* input */}
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                      placeholder="Message"
                      className="flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-400 text-sm"
                    />

                    {/* attachments */}
                    <button aria-label="Attach" className="p-1 rounded-full hover:bg-white/5">
                      <Paperclip size={18} />
                    </button>

                    {/* optional send icon (small) */}
                    <motion.button whileTap={{ scale: 0.94 }} onClick={sendMessage} aria-label="Send" className="ml-2 hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                      <Send size={14} />
                      <span>Send</span>
                    </motion.button>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}