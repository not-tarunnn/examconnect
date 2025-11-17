import { useState, useEffect } from "react";
import { FaFacebookMessenger, FaUsers, FaChartLine, FaTrophy, FaSearch, FaGooglePlusSquare, FaPlusCircle, FaPlusSquare, FaHandshake, FaHandshakeAltSlash, } from "react-icons/fa";
import { FaHandshakeAngle, FaMessage, FaRegMessage } from "react-icons/fa6";
import CreatePostModal from "@/components/community/CreatePostModal";
import useAuth from "@/hooks/useAuth";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import GlassLink from "@/components/community/GlassLink";

export default function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const [hasUnread, setHasUnread] = useState(false);

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

  return (
    <footer className="w-full mt-auto bg-transparent sticky bottom-3  z-10">
      <div className="px-6 py-2 max-w-7xl mr-[16rem] mx-auto">
        {/* Single row with icons and search bar */}
        <div className="flex justify-center items-center gap-8 text-xl text-gray-400">
          {/* Left icons */}
          <GlassLink
  href="/message"
  title="messages"
  Icon={FaFacebookMessenger}
  accent="#3b82f6" // blue ambient
  tint="rgba(59,130,246,0.22)" // blue tint
  size={40}
>
  {hasUnread && (
    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white/10 shadow-sm" />
  )}
</GlassLink>

          {/* Your Plus Button */}
   <GlassLink
  href="#"
  title="New Post"
  Icon={FaPlusSquare}
  onClick={(e) => {
    e.preventDefault();
    setIsModalOpen(true);
  }}
  accent="#30db5b" // Apple-style ambient green
  tint="rgba(255,205,56,0.22)" // soft yellow tint (Apple yellow)
  size={40}
/>


      {/* Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onCloseAction={() => setIsModalOpen(false)}
      />

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 bg-white/50 backdrop-blur-3xl border border-white/10 rounded-full px-3 py-1 pl-8 shadow-2xl text-black/80 placeholder-black/65 text-sm focus:outline-none focus:border-none focus:ring-10 focus:ring-none"
            />
            <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-black text-xs" />
          </div>

          {/* Right icons */}
          <GlassLink
      href="/peers"
      title="Peers"
      Icon={FaHandshakeAngle}
      accent="#30db5b" // Apple green ambient
      tint="rgba(48,219,91,0.20)"
      size={40}
    />
       <GlassLink
      href="/leaderboard"
      title="Leaderboard"
      Icon={FaTrophy}
      accent="#30db5b" // Apple green ambient
      tint="rgba(168,85,247,0.22)"
      size={40}
    />
        </div>
      </div>
    </footer>
  );
}
