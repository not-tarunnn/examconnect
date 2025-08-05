"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useChatStore } from "@/store/useChatStore";
import useAuth from "@/hooks/useAuth";

type User = {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string;
};

export default function FandGlist() {
  const [users, setUsers] = useState<User[]>([]);
  const { setSelectedUser } = useChatStore();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.uid) return;

      const snapshot = await getDocs(collection(db, "users"));
      const userList: User[] = [];

      snapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          const data = doc.data();
          userList.push({
            uid: doc.id,
            username: data.username,
            fullName: data.fullName,
            profilePic: data.profilePic || "",
          });
        }
      });

      setUsers(userList);
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <div className="p-8 pt-5 space-y-5 min-h-screen overflow-y-auto">
      {/* App Title */}
      <h1 className="text-xl font-bold tracking-tight">EXAM CONNECT</h1>

      {/* Section Title */}
      <h2 className="text-lg font-semibold text-gray-300">People</h2>

      {/* User List */}
      {users.map((user) => (
        <div
          key={user.uid}
          onClick={() => setSelectedUser(user)}
          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-800 rounded transition"
        >
          <img
            src={
              user.profilePic?.startsWith("data:")
                ? user.profilePic
                : user.profilePic || "/avatar.png"
            }
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-white">{user.fullName}</p>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
