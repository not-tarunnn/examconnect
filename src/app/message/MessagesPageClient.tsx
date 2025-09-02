"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import Sidebar from "@/components/Sidebar";
import FriendsAndGroupsList from "@/components/message/FandGlist";
import ChatTab from "@/components/message/ChatTab";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MessagesPageClient() {
  const { collapsed } = useSidebarStore();
  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const searchParams = useSearchParams();
  const { setSelectedUser } = useChatStore();

  useEffect(() => {
    const uid = searchParams.get("uid");
    if (!uid) return;
    const run = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return;
      const data: any = snap.data();
      setSelectedUser({
        uid,
        username: data.username || "",
        fullName: data.fullName || data.username || uid,
        profilePic: data.profilePic || "",
      });
    };
    void run();
  }, [searchParams, setSelectedUser]);

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
