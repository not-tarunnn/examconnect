"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import useUserData from "@/hooks/useUserData";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // adjust path if needed
import {
  FaHome,
  FaUsers,
  FaCog,
  FaStar,
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaAtom,
  FaClipboardList,
} from "react-icons/fa";
import { useSidebarStore } from "@/store/useSidebarStore";
import {  FaPlantWilt } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { collapsed, toggle } = useSidebarStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    // { label: "Dashboard", href: "/dashboard", icon: <FaHome /> },
    { label: "Study Planner", href: "/task", icon: <FaClipboardList /> },
    { label: "Sleep ", href: "/sleep", icon: <FaPlantWilt /> },
    { label: "Community", href: "/community", icon: <FaUsers /> },
  ];

 const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("Logged out");
    window.location.href = "/"; // Optional
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

  // Close dropdown on outside click
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
      <div
       className={`h-screen ${
       collapsed ? "w-16 bg-[#202020]" : "w-64 bg-[#181818]"
       } text-white flex flex-col justify-between border-r border-gray-800 shadow-md transition-all duration-300 relative`}
        >

      {/* Top Section */}
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-semibold tracking-tight text-white">
              <FaAtom/>
            </h1>
          )}
          <button
            onClick={toggle}
            className="py-2 px-2 hover:bg-[#2f2f2f] rounded-md transition text-white"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <FaBars />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col space-y-2 mt-4 text-md">
          {navItems.map((item) => (
<Link
  key={item.label}
  href={item.href}
  className="flex items-center gap-3 px-1 py-2 min-w-15 rounded-lg transition text-white hover:bg-[#2f2f2f]"
>
  {/* Icon always visible, never animates */}
<div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
  {item.icon}
</div>


  {/* Label fades in/out */}
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
        {/* <Link
          href="/premium"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition text-white hover:bg-[#2f2f2f] text-md"
        >
          <FaStar className="text-yellow-500"/>
          {!collapsed && "Premium"}
        </Link> */}
        
        
        {/* <Link
  href="/settings"
  className="flex items-center gap-3 px-1 py-2 min-w-15 rounded-lg transition text-white hover:bg-[#2f2f2f] text-md"
>
  
  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
    <FaCog />
  </div>


  <AnimatePresence mode="wait">
    {!collapsed && (
      <motion.span
        key="settings-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="whitespace-nowrap"
      >
        Settings
      </motion.span>
    )}
  </AnimatePresence>
</Link> */}

        {/* Dropdown */}
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
      e.currentTarget.src = "/default-profile.png"; // fallback if image fails
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
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      <span className="text-base font-bold mr-auto text-white">
        {userData.fullName || "User"}
      </span>
      {userData.username && (
        <span className="text-xs text-gray-400">@{userData.username}</span>
      )}
    </motion.div>
  )}
</AnimatePresence>
</button>


            {/* Dropdown Panel */}
            {dropdownOpen && (
  <div
    ref={dropdownRef}
    className={`absolute bottom-16 ${
      collapsed ? "left-0" : "left-0"
    } w-48 bg-[#2f2f2f] rounded-lg shadow-md p-2 text-sm z-50`}
  >
    <Link
      href={`profile/${userData?.username ?? ""}`}
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-md"
    >
      <FaUser />
      Profile
    </Link>
    <Link
      href="/accountsetting"
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-md"
    >
      <FaCog />
      Account Settings
    </Link>
    <button
      onClick={handleLogout}
      className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-red-600 rounded-md mt-1"
    >
      <FaSignOutAlt />
      Logout
    </button>
  </div>
)}

          </div>
        )}
      </div>
      
    </div>
  );
}
