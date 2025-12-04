"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { rtdb, db } from "@/lib/firebase";
import { ref, set, update, get } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { CheckCircle, Loader, AlertCircle, ArrowLeft } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import Link from "next/link";

type JoinState = "loading" | "confirm" | "joining" | "success" | "error";

export default function GroupJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { setSelectedGroup } = useChatStore();

  const groupId = searchParams.get("groupId");
  const [state, setState] = useState<JoinState>("loading");
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);

  // Fetch group info
  useEffect(() => {
    if (!groupId) {
      setError("Invalid invite link");
      setState("error");
      return;
    }

    if (authLoading) return;

    if (!user) {
      // Not authenticated, redirect to login
      router.push(`/login?redirect=/group/join?groupId=${groupId}`);
      return;
    }

    const loadGroupInfo = async () => {
      try {
        const groupRef = ref(rtdb, `chats/${groupId}`);
        const snap = await get(groupRef);

        if (!snap.exists()) {
          setError("Group not found");
          setState("error");
          return;
        }

        const data = snap.val();
        setGroupInfo({
          id: groupId,
          name: data.name || "Unknown Group",
          description: data.description || "",
          iconBase64: data.iconBase64 || null,
          iconMime: data.iconMime || null,
          memberCount: Object.keys(data.members || {}).length,
        });

        // Check if user is already a member
        const memberRef = ref(rtdb, `chats/${groupId}/members/${user.uid}`);
        const memberSnap = await get(memberRef);
        if (memberSnap.exists()) {
          setAlreadyMember(true);
          setState("success");
        } else {
          setState("confirm");
        }
      } catch (err) {
        console.error("Failed to load group:", err);
        setError("Failed to load group information");
        setState("error");
      }
    };

    loadGroupInfo();
  }, [groupId, user, authLoading, router]);

  const handleJoinGroup = useCallback(async () => {
    if (!user?.uid || !groupId) return;

    setState("joining");
    try {
      // Add user to group members
      await set(ref(rtdb, `chats/${groupId}/members/${user.uid}`), {
        joined: Date.now(),
        role: "member",
      });

      // Create chat entry in user's chats list
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const username = userData?.username || user.displayName || user.uid;
      const fullName = userData?.fullName || user.displayName || username;

      // Add to user's groups list
      await set(ref(rtdb, `user/${user.uid}/groups/${groupId}`), {
        joinedAt: Date.now(),
      });

      setState("success");

      // Auto-select the group in chat store
      if (groupInfo) {
        setSelectedGroup({
          groupId,
          name: groupInfo.name,
          iconBase64: groupInfo.iconBase64,
          iconMime: groupInfo.iconMime,
        });
      }
    } catch (err) {
      console.error("Failed to join group:", err);
      setError("Failed to join group. Please try again.");
      setState("error");
    }
  }, [user?.uid, groupId, groupInfo, setSelectedGroup]);

  if (authLoading || state === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-indigo-500"
        >
          <Loader size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1a1a1a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {state === "confirm" && groupInfo && (
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {groupInfo.iconBase64 ? (
                  <img
                    src={`data:${groupInfo.iconMime};base64,${groupInfo.iconBase64}`}
                    alt={groupInfo.name}
                    className="w-20 h-20 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold">
                    {groupInfo.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{groupInfo.name}</h1>
              {groupInfo.description && (
                <p className="text-zinc-300 text-sm mb-4">{groupInfo.description}</p>
              )}
              <p className="text-[13px] text-zinc-400">
                {groupInfo.memberCount} members in this group
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-center text-sm text-zinc-300">
                You've been invited to join this group. Click below to accept the invitation.
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinGroup}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Join Group
              </motion.button>
              <Link href="/message">
                <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold transition-colors">
                  Maybe Later
                </button>
              </Link>
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <CheckCircle size={64} className="text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {alreadyMember ? "You're Already a Member!" : "Welcome to the Group!"}
            </h2>
            <p className="text-zinc-300 mb-6">
              {alreadyMember
                ? `You're already a member of ${groupInfo?.name}`
                : `You've successfully joined ${groupInfo?.name}`}
            </p>
            <Link href="/message">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Go to Messages
              </motion.button>
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <AlertCircle size={64} className="text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Invite</h2>
            <p className="text-zinc-300 mb-6">{error || "Something went wrong"}</p>
            <Link href="/message">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Messages
              </motion.button>
            </Link>
          </div>
        )}

        {state === "joining" && (
          <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="flex justify-center mb-6 text-indigo-500"
            >
              <Loader size={48} />
            </motion.div>
            <h2 className="text-xl font-bold text-white">Joining Group...</h2>
            <p className="text-zinc-300 mt-2">Please wait</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
