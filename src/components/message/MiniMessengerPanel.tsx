"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import FandGlistMini from "./FandGlistMini";
import { useChatStore } from "@/store/useChatStore";
import ChatTabMini from "./ChatTabMini";

export default function MiniMessengerPanel() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggle = () => {
    if (open) {
      setIsClosing(true);
      setTimeout(() => {
        setOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {/* Floating Messenger Button */}
      <AnimatePresence>
        {!open && !isClosing && (
          <motion.button
            key="messenger-fab"
            onClick={handleToggle}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 border border-white/10"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-label="Open Messenger"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Messenger Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="messenger-panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 w-[340px] h-[540px] rounded-3xl bg-zinc-900/70 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            
     
  <div className="flex items-center justify-between px-3 py-0.5">
  {/* Left: Back button placeholder if no selected user */}
  <button
    onClick={() => selectedUser && setSelectedUser(null as any)}
    className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all ${
      !selectedUser ? "cursor-default opacity-50" : ""
    }`}
    aria-label="Back to chats"
  >
    <ArrowLeft size={18} />
  </button>

  {/* Center: Title always centered */}
  <motion.div
    className="flex-1 flex justify-center"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ duration: 0.25 }}
  >
    <h2 className="text-lg font-semibold">Messages</h2>
  </motion.div>

  {/* Right: Minimize button always visible */}
  <button
    onClick={handleToggle}
    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
    aria-label="Minimize Messenger"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  </button>
</div>


            {/* Main content */}
            <AnimatePresence mode="wait">
              {!selectedUser ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex-1 overflow-y-auto">
                    <FandGlistMini />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col h-full w-[350px]"
                >
                 
                  <div className="flex-1">
                    <ChatTabMini compact />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
