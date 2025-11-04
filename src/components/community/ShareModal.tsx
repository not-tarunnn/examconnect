"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Facebook, Instagram, Twitter, Link, MessageCircle } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6"; 
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  postUrl: string;
  theme?: "dark" | "light"; // default to dark
}

export default function ShareModal({ open, onClose, postUrl, theme = "dark" }: ShareModalProps) {
  const isDark = theme === "dark";

  const shareLinks = [
    {
  name: "WhatsApp",
  icon: <MessageCircle className="w-6 h-6 text-green-500" />,
  url: `https://wa.me/?text=${encodeURIComponent(
    `Hey! Check out this new post from ExamConnect: ${postUrl}`
  )}`
},
    { name: "Facebook", icon: <Facebook className="w-6 h-6 text-blue-500" />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}` },
    { name: "Instagram", icon: <Instagram className="w-6 h-6 text-pink-500" />, url: `https://www.instagram.com/` },
    { name: "X", icon: <FaXTwitter className="w-6 h-6 text-white" />, url: `https://x.com/intent/tweet?url=${encodeURIComponent(postUrl)}` },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      alert("Link copied!");
    } catch {
      alert("Failed to copy link.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Background Overlay */}
          <motion.div
            className={`fixed inset-0 z-40 backdrop-blur-sm ${isDark ? "bg-black/40" : "bg-gray-200/40"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`fixed z-50 inset-x-0 bottom-0 mx-auto max-w-sm rounded-t-3xl shadow-xl p-6 flex flex-col items-center
              ${isDark ? "bg-[#202020] text-white" : "bg-white text-gray-800"}
            `}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <div className="flex items-center justify-between w-full mb-4">
              <h2 className="text-lg font-semibold">{`Share this post`}</h2>
              <button onClick={onClose} className={isDark ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              className="flex justify-around w-full"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
              }}
            >
              {shareLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className={`flex flex-col items-center gap-1 text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                  <div className={`p-3 rounded-full shadow-sm ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
                    {link.icon}
                  </div>
                  {link.name}
                </motion.a>
              ))}
            </motion.div>

            <button
              onClick={copyLink}
              className={`flex items-center gap-2 mt-5 px-4 py-2 text-sm rounded-full border transition
                ${isDark
                  ? "border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
            >
              <Link className="w-4 h-4" /> Copy Link
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
