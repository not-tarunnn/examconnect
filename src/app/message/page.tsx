"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import Sidebar from "@/components/Sidebar";
import FriendsAndGroupsList from "@/components/message/FandGlist";
import ChatTab from "@/components/message/ChatTab";

export default function MessagesPage() {
  const { collapsed } = useSidebarStore();
  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <div className="flex h-screen bg-[#202020] text-white">
  {/* Sidebar */}
  <div className={`bg-[#1a1a1a] transition-all duration-300 ${sidebarWidth}`}>
    <Sidebar />
  </div>

  {/* Main content */}
<div className="flex flex-1 overflow-hidden">
  {/* Friend List */}
  <div className="w-1/4 min-w-[200px] max-w-[300px] border-r border-gray-700 bg-[#181818] overflow-y-auto">
    <FriendsAndGroupsList />
  </div>

  {/* Chat Area */}
  <div className="flex-1 bg-[#121212] flex flex-col overflow-hidden">
    <ChatTab />
  </div>
</div>

</div>

  );
}
