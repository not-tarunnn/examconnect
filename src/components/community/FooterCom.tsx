import { useState } from "react";
import { FaFacebookMessenger, FaUsers, FaChartLine, FaTrophy, FaSearch, FaGooglePlusSquare, FaPlusCircle, FaPlusSquare, } from "react-icons/fa";
import { FaMessage, FaRegMessage } from "react-icons/fa6";
import CreatePostModal from "@/components/community/CreatePostModal";


export default function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
  return (
    <footer className="w-full mt-auto bg-transparent sticky bottom-3  z-10">
      <div className="px-6 py-2 max-w-7xl mr-[16rem] mx-auto">
        {/* Single row with icons and search bar */}
        <div className="flex justify-center items-center gap-8 text-xl text-gray-400">
          {/* Left icons */}
          <a href="/message" className="hover:text-white transition" title="Friends">
            <FaFacebookMessenger />
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
              className="w-64 bg-white border border-gray-300 rounded-full px-3 py-1 pl-8 text-black placeholder-gray-500 text-sm focus:outline-none focus:border-none focus:ring-10 focus:ring-none"
            />
            <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
          </div>

          {/* Right icons */}
          <a href="#" className=" hover:text-white transition" title="Trending">
            <FaChartLine />
          </a>
          <a href="#" className="hover:text-white transition" title="Leaderboards">
            <FaTrophy />
          </a>
        </div>
      </div>
    </footer>
  );
}
