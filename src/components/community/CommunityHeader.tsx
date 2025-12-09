"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Community, joinCommunity, leaveCommunity } from "@/lib/communityService";
import { getAuth } from "firebase/auth";
import { Shield, Settings, Users, MessageSquare } from "lucide-react";

export default function CommunityHeader({
  community,
  isMember,
  onMembershipChange,
}: {
  community: Community;
  isMember: boolean;
  onMembershipChange: (isMember: boolean) => void;
}) {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const handleJoin = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (community.id) {
        await joinCommunity(community.id, user.uid);
        onMembershipChange(true);
      }
    } catch (error) {
      console.error("Error joining community:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !community.id) return;

    setLoading(true);
    try {
      await leaveCommunity(community.id, user.uid);
      onMembershipChange(false);
    } catch (error) {
      console.error("Error leaving community:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCreator = user?.uid === community.createdBy;

  return (
    <div className="bg-[#1a1a1a] border-b border-[#343536]">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
        )}
      </div>

      {/* Content Container */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Icon and Info */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Icon */}
            <div className="flex items-end gap-4">
              <div className="relative -mt-20">
                {community.iconUrl ? (
                  <img
                    src={community.iconUrl}
                    alt={community.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#1a1a1a]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-[#1a1a1a]">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Handle */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-white">{community.name}</h1>
                  {community.isVerified && (
                    <Shield size={24} className="text-blue-400" />
                  )}
                </div>
                <p className="text-gray-400 text-lg">c/{community.handle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-base max-w-2xl">{community.description}</p>

            {/* Meta Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={18} className="text-blue-400" />
                <span className="text-white font-medium">{community.memberCount.toLocaleString()}</span>
                <span>members</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MessageSquare size={18} className="text-green-400" />
                <span className="text-white font-medium">{community.category}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 md:min-w-fit">
            {isCreator && (
              <button className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-[#2a2a2a] text-white hover:bg-[#343536] transition-colors">
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
            <button
              onClick={isMember ? handleLeave : handleJoin}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                isMember
                  ? "bg-[#2a2a2a] text-white hover:bg-red-600/20 hover:text-red-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Loading..." : isMember ? "Leave" : "Join"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-[#343536] px-4 md:px-6 flex gap-8">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-4 font-medium border-b-2 transition-colors ${
            activeTab === "posts"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`py-4 font-medium border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Rules
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`py-4 font-medium border-b-2 transition-colors ${
            activeTab === "about"
              ? "border-blue-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          About
        </button>
      </div>
    </div>
  );
}
