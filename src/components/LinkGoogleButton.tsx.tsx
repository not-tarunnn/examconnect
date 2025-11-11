"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, linkWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LinkGoogleButton({ collapsed }: { collapsed: boolean }) {
  const [isLinking, setIsLinking] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const router = useRouter(); // 👈 for redirect

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAnonymous(user.isAnonymous);
      } else {
        setIsAnonymous(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const linkGoogleAccount = async () => {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) {
      alert("You must be logged in anonymously first!");
      return;
    }

    const provider = new GoogleAuthProvider();
    setIsLinking(true);

    try {
      await linkWithPopup(auth.currentUser, provider);
      alert("✅ Google account linked successfully!");

      // 👇 redirect after success
      router.push("/login"); // or "/dashboard", depending on your app flow
    } catch (error: any) {
      console.error("Error linking Google account:", error);
      alert("Failed to link Google account: " + error.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Hide the button if user is not anonymous or not yet loaded
  if (isAnonymous === null || isAnonymous === false) return null;

  return (
    <button
      onClick={linkGoogleAccount}
      disabled={isLinking}
      className="flex items-center gap-3 px-1 py-2 min-w-15 rounded-lg transition text-white hover:bg-[#2f2f2f] text-md w-full text-left disabled:opacity-50"
    >
      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
        <FcGoogle className="text-xl" />
      </div>
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            key="google-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            {isLinking ? "Linking..." : "Link Google"}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
