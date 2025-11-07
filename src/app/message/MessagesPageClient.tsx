"use client";

import { useSidebarStore } from "@/store/useSidebarStore";
import Sidebar from "@/components/Sidebar";
import FriendsAndGroupsList from "@/components/message/FandGlist";
import ChatTab from "@/components/message/ChatTab";
import { useEffect, useState, useCallback } from "react";
import { useChatStore } from "@/store/useChatStore";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MessagesPageClient() {
  const { collapsed } = useSidebarStore();
  const sidebarWidth = collapsed ? "w-16" : "w-64";

  const { selectedUser, setSelectedUser: rawSetSelectedUser } = useChatStore();
  const setSelectedUser = useCallback(
    (user: any) => rawSetSelectedUser(user),
    [rawSetSelectedUser]
  );

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // ✅ Detect mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767.98px)");

    const update = (matches: boolean) => {
      setIsMobile((prev) => (prev === matches ? prev : matches));
    };
    update(mql.matches);

    const listener = (e: MediaQueryListEvent) => update(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  // ✅ Fetch selected user by ?uid param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    if (!uid) return;

    if (selectedUser?.uid === uid) return;

    let canceled = false;
    const fetchUser = async () => {
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (canceled || !snap.exists()) return;

        const data: any = snap.data();
        setSelectedUser({
          uid,
          username: data.username || "",
          fullName: data.fullName || data.username || uid,
          profilePic: data.profilePic || "",
        });
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };
    void fetchUser();

    return () => {
      canceled = true;
    };
  }, [selectedUser?.uid, setSelectedUser]);

  const handleBack = () => setSelectedUser(null);

  if (isMobile === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#202020] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#202020] text-white">
      {/* ✅ Sidebar (hidden on mobile when chat is open) */}
      {!isMobile || !selectedUser ? (
        <div
          className={`z-[200] sm:relative fixed md:relative transition-all duration-300 ${sidebarWidth}`}
        >
          <Sidebar />
        </div>
      ) : null}

      {/* ✅ Main content */}
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          <>
            {!selectedUser ? (
              <div className="flex-1 bg-[#181818] overflow-y-auto">
                <FriendsAndGroupsList />
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden">
                {/* Back header */}
                <div className="flex items-center p-3 border-b border-white/10 bg-[#1e1e1e]">
                  <button
                    onClick={handleBack}
                    className="text-white text-sm font-medium mr-3 px-2 py-1 rounded hover:bg-white/10"
                  >
                    ← Back
                  </button>
                  <span className="font-semibold truncate">
                    {selectedUser.fullName || "Chat"}
                  </span>
                </div>
                <ChatTab />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-1/4 min-w-[200px] max-w-[300px] border-r border-gray-700 bg-[#181818] overflow-y-auto">
              <FriendsAndGroupsList />
            </div>
            <div className="flex-1 bg-[#121212] flex flex-col overflow-hidden">
              <ChatTab />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
