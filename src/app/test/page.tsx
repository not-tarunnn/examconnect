// DMPage_White_Minimal_UI.tsx
// Fullscreen React component (TypeScript + Tailwind + Framer Motion) with Sidebar
"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Users,
  Camera,
  MoreVertical,
  Send,
  Paperclip,
  Plus,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

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

const SAMPLE_FRIENDS: User[] = [
  { id: "u1", name: "Aarav", last: "Sent a photo", time: "11:23", unread: 2, color: "bg-indigo-100" },
  { id: "u2", name: "Maya", last: "Haha nice", time: "10:05", color: "bg-amber-100" },
  { id: "u3", name: "Rohan", last: "Let's meet", time: "Yesterday", color: "bg-emerald-100" },
  { id: "u4", name: "Zoya", last: "Typing...", time: "08:01", unread: 1, color: "bg-pink-100" },
];

const SAMPLE_GROUPS: User[] = [
  { id: "g1", name: "Design Crew", last: "New Figma file", time: "09:30", color: "bg-violet-100" },
  { id: "g2", name: "Family", last: "Dinner?", time: "Yesterday", color: "bg-sky-100" },
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
    <div className="w-screen h-screen bg-white text-black font-sans flex">
      
     <Sidebar/>
    

      <div className="flex-1 grid md:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_300px]">
        {/* LEFT: Friends & Groups */}
        <aside className="border-r border-gray-200 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm">
              <Plus size={14} /> New
            </button>
          </div>

          <div className="flex items-center gap-3 px-1 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search friends, groups..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-200 text-black"
              />
            </div>
            <button className="p-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100">
              <Users size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">Friends</h3>
              <div className="space-y-2">
                {filteredFriends.map((f) => (
                  <motion.button
                    key={f.id}
                    onClick={() => chooseUser(f)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-gray-50 ${selected?.id === f.id ? "bg-indigo-50" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${f.color || "bg-gray-100"}`}>
                      {f.name.split(" ")[0].slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">{f.name}</div>
                        <div className="text-xs text-gray-400">{f.time}</div>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{f.last}</div>
                    </div>
                    {f.unread ? (
                      <div className="min-w-[22px] text-xs h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center px-2">{f.unread}</div>
                    ) : null}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">Groups</h3>
              <div className="space-y-2">
                {groups.map((g) => (
                  <motion.button key={g.id} whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-gray-50">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${g.color || "bg-gray-100"}`}>
                      {g.name.split(" ")[0].slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">{g.name}</div>
                        <div className="text-xs text-gray-400">{g.time}</div>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{g.last}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: Messages area */}
        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-lg font-semibold text-indigo-700">{selected?.name?.slice(0,1)}</div>
              <div>
                <div className="text-sm font-semibold">{selected?.name}</div>
                <div className="text-xs text-gray-400">Active now</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-gray-50"><Camera size={16} /></button>
              <button className="p-2 rounded-xl hover:bg-gray-50"><MoreVertical size={16} /></button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-6">
            <div ref={messagesRef} className="h-full overflow-auto pr-2 pb-6 flex flex-col gap-4">
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className={`max-w-[70%] ${m.sender === "me" ? "self-end" : "self-start"}`}>
                    <div className={`${m.sender === "me" ? "bg-indigo-600 text-white rounded-2xl rounded-br-md" : "bg-gray-100 text-black rounded-2xl rounded-bl-md"} px-4 py-2 shadow-sm`}>
                      <div className="text-sm leading-relaxed">{m.text}</div>
                      <div className={`text-[10px] mt-1 ${m.sender === "me" ? "text-indigo-100" : "text-gray-500"}`}>{m.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-gray-50"><Paperclip size={18} /></button>
              <div className="flex-1">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  placeholder="Write a message..."
                  className="w-full px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-200 text-black"
                />
              </div>
              <motion.button whileTap={{ scale: 0.92 }} onClick={sendMessage} className="rounded-2xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-lg">
                <Send size={16} />
                <span className="hidden sm:inline text-sm font-medium">Send</span>
              </motion.button>
            </div>
          </div>
        </main>

        {/* RIGHT: Details */}
        <aside className="hidden xl:block border-l border-gray-200 p-4 overflow-y-auto">
          <div className="text-sm font-semibold mb-3">{selected?.name}</div>
          <div className="text-xs text-gray-500 mb-4">Members</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center">A</div>
              <div>
                <div className="text-sm font-medium">You</div>
                <div className="text-xs text-gray-400">Owner</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center">M</div>
              <div>
                <div className="text-sm font-medium">Maya</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </div>

            <button className="mt-4 w-full rounded-xl py-2 bg-gray-50 border border-gray-200">View profile</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
