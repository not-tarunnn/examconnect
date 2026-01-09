import { useState, useEffect } from "react";
import {
  FaSearch,
} from "react-icons/fa";
import CreatePostModal from "@/components/community/CreatePostModal";
import useAuth from "@/hooks/useAuth";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import Dock from "@/components/Dock";
import { FaRegHandshake, FaRegComments, FaRegSquarePlus,FaRegPaperPlane, FaRegCommentDots } from "react-icons/fa6";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  // Listen for unread messages
  useEffect(() => {
    if (!user?.uid) {
      setHasUnread(false);
      return;
    }
    const messagesRoot = ref(rtdb, `messages`);
    const unsub = onValue(messagesRoot, (snap) => {
      const val = snap.val() || {};
      let found = false;
      for (const chatId of Object.keys(val)) {
        if (!chatId.includes(user.uid)) continue;
        const chat = val[chatId] || {};
        for (const key of Object.keys(chat)) {
          if (key === "typing" || key === "participants" || key === "lastMessageAt") continue;
          const msg = chat[key];
          if (!msg || typeof msg !== "object") continue;
          const sender = msg.sender;
          const readBy = msg.readBy || {};
          if (sender !== user.uid && !readBy[user.uid]) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      setHasUnread(found);
    });
    return () => unsub();
  }, [user?.uid]);

  // Dock items
  const dockItems = [
    {
      icon: (
        <>
          <FaRegCommentDots size={20} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white/10 shadow-sm" />
          )}
        </>
      ),
      label: "Messages",
      onClick: () => (window.location.href = "/message"),
    },
    {
      icon: <FaRegSquarePlus size={20} />,
      label: "New Post",
      onClick: () => setIsModalOpen(true),
    },
    {
      icon: <FaRegHandshake size={20} />,
      label: "Synergy",
      onClick: () => (window.location.href = "/synergy"),
    },
    {
      icon: <FaRegPaperPlane size={20} />,
      label: "Leaderboard",
      onClick: () => (window.location.href = "/leaderboard"),
    },
  ];

  return (
    <footer className="w-full mt-auto bg-transparent sticky bottom-3 z-10">
      <div className="px-6 py-2 max-w-7xl mr-[16rem] mx-auto">
        {/* Dock replacing buttons */}
        <div className="relative w-full flex justify-center">
          <Dock
            items={dockItems}
            baseItemSize={40}
            magnification={70}
            distance={150}
            dockHeight={100}
            panelHeight={60}
            spring={{ mass: 0.2, stiffness: 200, damping: 15 }}
            className="mx-auto"
          />
        </div>

        {/* Modal */}
        <CreatePostModal
          isOpen={isModalOpen}
          onCloseAction={() => setIsModalOpen(false)}
        />

        {/* Search Bar
        <div className="relative mt-4 flex justify-center">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-white/50 backdrop-blur-3xl border border-white/10 rounded-full px-3 py-1 pl-8 shadow-2xl text-black/80 placeholder-black/65 text-sm focus:outline-none focus:border-none focus:ring-10 focus:ring-none"
          />
          <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-black text-xs" />
        </div> */}
      </div>
    </footer>
  );
}
