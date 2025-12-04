"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, X } from "lucide-react";
import { useShareModalStore } from "@/store/useShareModalStore";

export default function ShareInviteModal() {
  const { open, groupId, groupName, closeModal } = useShareModalStore();
  const [copied, setCopied] = useState(false);

  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/group/join?groupId=${groupId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on ExamConnect`,
          text: `You're invited to join ${groupName} on ExamConnect!`,
          url: inviteLink,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#181818] border border-white/10 rounded-2xl shadow-xl p-6 w-96 max-w-[90vw]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Share Group Invite</h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-zinc-300 mb-4">
              Share this link to invite people to <span className="font-semibold">{groupName}</span>
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-sm text-white/80 truncate"
                />
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                {navigator.share && (
                  <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
