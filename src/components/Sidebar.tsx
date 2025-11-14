"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import useUserData from "@/hooks/useUserData";
import { signOut } from "firebase/auth";
import { auth, rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { FaUsers, FaCog, FaBars, FaUser, FaSignOutAlt, FaAtom, FaClipboardList } from "react-icons/fa";
import { useSidebarStore } from "@/store/useSidebarStore";
import { FaFacebookMessenger, FaMessage, FaPencil, FaPlantWilt, FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import LinkGoogleButton from "@/components/LinkGoogleButton.tsx";

export default function Sidebar() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { collapsed, toggle } = useSidebarStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const navItems = [
    { label: "Study Planner", href: "/task", icon: <FaClipboardList /> },
    { label: "Sleep ", href: "/sleep", icon: <FaPlantWilt /> },
    { label: "Community", href: "/community", icon: <FaUsers /> },
    { label: "Messages", href: "/message", icon: <FaFacebookMessenger />, mobileOnly: true },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
  {/* Small floating hamburger button for mobile */}
<div className="md:hidden fixed top-4 left-4 z-[1000]">
  <button
    aria-label="Open menu"
    onClick={() => setMobileOpen(true)}
    className="p-3 rounded-xl bg-[#202020]/90 backdrop-blur-md border border-white/10 shadow-lg text-white hover:bg-white/10 active:scale-95 transition"
    title="Open menu"
  >
    <FaBars className="text-lg" />
  </button>
</div>


      {/* Mobile overlay drawer - bottom sheet, doesn't cover the header area */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 right-0 bottom-0 top-0 z-[2000] bg-black/60 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed left-0 right-0 bottom-0 rounded-t-2xl border-t border-white/10 bg-[#202020] text-white shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-3 px-4 border-b border-white/10">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userData?.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <FaUser className="text-base" />
                      </div>
                    )}
                    <div className="leading-tight">
                      <div className="font-semibold">{userData?.fullName || user?.displayName || "Account"}</div>
                      <div className="text-xs text-gray-300">{userData?.username ? `@${userData.username}` : (user?.email || "")}</div>
                    </div>
                  </div>
                  <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-white/5">
                    <FaXmark />
                  </button>
                </div>
              </div>

              <nav className="p-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="relative flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
                    <span className="text-base">{item.label}</span>
                    
                    
{/* Messages unread */}
{item.href === "/message" && hasUnread && (
  <span className="ml-auto h-2 w-2 rounded-full bg-red-500 shadow-sm border border-white/10" />
)}

                  </Link>
                ))}

                <div className="my-2 h-px bg-white/10" />
                <div className="px-1.5">
             <LinkGoogleButton collapsed={false} />
             </div>
                <Link
                  href="/accountsetting"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5"
                >
                  <FaCog className="w-5 h-5" />
                  <span>Account Settings</span>
                </Link>

                {user && userData && (
                  <Link
                    href={`/profile/${userData.username ?? ""}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5"
                  >
                    <FaUser />
                    <span>View Profile</span>
                  </Link>
                )}

                <Link
                  href="/release-notes"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5"
                >
                  <FaPencil />
                  <span>Release Notes</span>
                </Link>

                {user && (
                  <div className="px-2 py-2">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-red-600/80 bg-white/5"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex h-screen ${
          collapsed ? "w-16 bg-[#202020]" : "w-64 bg-[#181818]"
        } text-white flex-col justify-between border-r border-gray-800 shadow-md transition-all duration-300 relative`}
      >
        {/* Top Section */}
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h1 className="text-xl font-semibold tracking-tight text-white">
                <FaAtom />
              </h1>
            )}
            <button onClick={toggle} className="py-2 px-2 hover:bg-[#2f2f2f] rounded-md transition text-white" title={collapsed ? "Expand" : "Collapse"}>
              <FaBars />
            </button>
          </div>

          {/* Nav Links */}
<nav className="flex flex-col space-y-2 mt-4 text-md">
  {navItems
    .filter((item) => !item.mobileOnly) // hide "Messages" on desktop
    .map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className="relative flex items-center gap-3 px-1 py-2 min-w-15 rounded-lg transition text-white hover:bg-[#2f2f2f]"
      >
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
          {item.icon}
        </div>
      
        {item.href === "/community" && hasUnread && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 shadow-sm border border-white/10" />
        )}

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    ))}
</nav>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col px-4 pb-4 space-y-3 text-white relative">

 <LinkGoogleButton collapsed={collapsed} />

          <Link href="/accountsetting" className="flex items-center gap-3 px-1 py-2 min-w-15 rounded-lg transition text-white hover:bg-[#2f2f2f] text-md">
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <FaCog />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span key="settings-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="whitespace-nowrap">
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {user && (
            <div className="relative pt-4 border-t border-gray-800">
              <button
                ref={buttonRef}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full flex items-center gap-3 px-0 py-2 hover:bg-[#2f2f2f] rounded-lg transition text-white"
                title={user.email ?? "Account"}
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/default-profile.png";
                    }}
                    className="w-8 h-8 min-w-8  rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 min-w-8 rounded-full bg-[#2f2f2f] flex items-center justify-center text-white shrink-0">
                    <FaUser className="text-sm" />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!collapsed && userData && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="flex flex-col">
                      <span className="text-base font-bold mr-auto text-white">{userData.fullName || "User"}</span>
                      {userData.username && <span className="text-xs text-gray-400">@{userData.username}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {dropdownOpen && (
                <div ref={dropdownRef} className={`absolute bottom-16 left-0 w-48 bg-[#2f2f2f] rounded-lg shadow-md p-2 text-sm z-50`}>
                  <Link href={`/profile/${userData?.username ?? ""}`} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-md">
                    <FaUser />
                    Profile
                  </Link>
                  <Link href="/release-notes" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-md">
                    <FaPencil />
                    Release Notes
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-red-600 rounded-md mt-1">
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
