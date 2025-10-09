import { useState, useEffect } from "react";
import { FaFacebookMessenger, FaUsers, FaChartLine, FaTrophy, FaSearch, FaGooglePlusSquare, FaPlusCircle, FaPlusSquare, FaHandshake, FaHandshakeAltSlash, } from "react-icons/fa";
import { FaHandshakeAngle, FaMessage, FaRegMessage } from "react-icons/fa6";
import CreatePostModal from "@/components/community/CreatePostModal";
import useAuth from "@/hooks/useAuth";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

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
          <a href="/message" className="relative hover:text-white transition" title="Friends">
            <FaFacebookMessenger />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white/10 shadow-sm" />
            )}
          </a>
          {/* Your Plus Button */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className="hover:text-white transition cursor-pointer"
        title="New Post"
      >
        <FaPlusSquare size={24} />
      </a>

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
          <a href="#" className=" hover:text-white transition" title="Peers">
            <FaHandshakeAngle />
          </a>
          <a href="#" className="hover:text-white transition" title="Leaderboards">
            <FaTrophy />
          </a>
        </div>
      </div>
    </footer>
  );
}
