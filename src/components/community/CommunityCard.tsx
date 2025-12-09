"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Community, joinCommunity, leaveCommunity } from "@/lib/communityService";
import { getAuth } from "firebase/auth";
import { Users, Shield } from "lucide-react";
import Link from "next/link";

export default function CommunityCard({ community }: { community: Community }) {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [isMember, setIsMember] = useState(
    user && community.members ? community.members[user.uid] || false : false
  );
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (community.id) {
        await joinCommunity(community.id, user.uid);
        setIsMember(true);
      }
    } catch (error) {
      console.error("Error joining community:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !community.id) return;

    setLoading(true);
    try {
      await leaveCommunity(community.id, user.uid);
      setIsMember(false);
    } catch (error) {
      console.error("Error leaving community:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/c/${community.handle}`}>
      <div className="bg-[#1a1a1a] border border-[#343536] rounded-lg p-4 hover:border-[#434344] transition-all duration-200 cursor-pointer">
        {/* Header with icon and info */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {community.iconUrl ? (
              <img
                src={community.iconUrl}
                alt={community.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name and handle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold truncate">{community.name}</h3>
              {community.isVerified && <Shield size={16} className="text-blue-400 flex-shrink-0" />}
            </div>
            <p className="text-gray-400 text-sm">c/{community.handle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{community.description}</p>

        {/* Meta info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{community.memberCount.toLocaleString()} members</span>
            </div>
            <span className="px-2 py-1 bg-[#2a2a2a] rounded text-gray-300">
              {community.category}
            </span>
          </div>
        </div>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {community.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-[#2a2a2a] text-gray-300"
              >
                #{tag}
              </span>
            ))}
            {community.tags.length > 2 && (
              <span className="text-xs px-2 py-1 text-gray-400">
                +{community.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Join/Leave Button */}
        <button
          onClick={isMember ? handleLeave : handleJoin}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
            isMember
              ? "bg-[#2a2a2a] text-white hover:bg-red-600/20 hover:text-red-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Loading..." : isMember ? "Joined" : "Join"}
        </button>
      </div>
    </Link>
  );
}
