"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useState } from "react";
import Link from "next/link";
import ShareModal from "@/components/community/ShareModal";

export type PostProps = {
  id: string;
  title: string;
  mediaUrl: string;
  type: "image" | "video";
  reactions: {
    likes: number;
    dislikes: number;
    likedBy?: Record<string, boolean>;
    dislikedBy?: Record<string, boolean>;
  };
  commentsCount: number;
  views?: number;
  author: {
    id: string;
    username: string;
    profilePic?: string;
    isGroup?: boolean;
  };
  createdAt: any;
  subreddit?: string;
};

export default function PostCard({ post }: { post: PostProps }) {
  const router = useRouter();
  const auth = getAuth();
  const [showShare, setShowShare] = useState(false);

  const [likes, setLikes] = useState(post.reactions.likes);
  const [dislikes, setDislikes] = useState(post.reactions.dislikes);

  const timeAgo = post.createdAt
    ? formatDistanceToNow(
        post.createdAt.toDate?.() || new Date(post.createdAt),
        { addSuffix: true }
      )
    : "just now";

  const handleVote = async (type: "like" | "dislike") => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to vote.");
      return;
    }

    const postRef = doc(db, "posts", post.id);
    const snap = await getDoc(postRef);

    if (!snap.exists()) return;
    const data = snap.data();
    const likedBy = data.reactions?.likedBy || {};
    const dislikedBy = data.reactions?.dislikedBy || {};

    const updates: Record<string, any> = {};

    if (type === "like") {
      if (likedBy[user.uid]) {
        // Undo like
        delete likedBy[user.uid];
        updates["reactions.likedBy"] = likedBy;
        updates["reactions.likes"] = increment(-1);
        setLikes(prev => prev - 1);
      } else {
        // Remove dislike if exists
        if (dislikedBy[user.uid]) {
          delete dislikedBy[user.uid];
          updates["reactions.dislikedBy"] = dislikedBy;
          updates["reactions.dislikes"] = increment(-1);
          setDislikes(prev => prev - 1);
        }
        // Add like
        likedBy[user.uid] = true;
        updates["reactions.likedBy"] = likedBy;
        updates["reactions.likes"] = increment(1);
        setLikes(prev => prev + 1);
      }
    }

    if (type === "dislike") {
      if (dislikedBy[user.uid]) {
        // Undo dislike
        delete dislikedBy[user.uid];
        updates["reactions.dislikedBy"] = dislikedBy;
        updates["reactions.dislikes"] = increment(-1);
        setDislikes(prev => prev - 1);
      } else {
        // Remove like if exists
        if (likedBy[user.uid]) {
          delete likedBy[user.uid];
          updates["reactions.likedBy"] = likedBy;
          updates["reactions.likes"] = increment(-1);
          setLikes(prev => prev - 1);
        }
        // Add dislike
        dislikedBy[user.uid] = true;
        updates["reactions.dislikedBy"] = dislikedBy;
        updates["reactions.dislikes"] = increment(1);
        setDislikes(prev => prev + 1);
      }
    }

    await updateDoc(postRef, updates);
  };

  return (
    <div className="bg-transparent rounded-lg mb-4 hover:bg-[#202020] transition-colors duration-200 group">
      <div className="flex">
        {/* Vote Buttons */}
        <div className="flex flex-col items-center bg-transparent p-2 rounded-l-lg">
          <button
            className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-green-500 transition-colors"
            onClick={() => handleVote("like")}
          >
            <ChevronUp size={20} />
          </button>
          <span className="text-xs font-medium text-white px-1">{likes}</span>
          <span className="text-xs font-medium text-white px-1">{dislikes}</span>
          <button
            className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-orange-500 transition-colors"
            onClick={() => handleVote("dislike")}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Post Content */}
        <div className="flex-1 p-3">
          {/* Header */}
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <div className="flex items-center space-x-2">
              <img
                src={post.author.profilePic || "/api/placeholder/24/24"}
                alt={post.author.username}
                className="w-5 h-5 rounded-full bg-gray-600"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/24/24";
                }}
              />
              <Link
                href={`/profile/${post.author.username}`}
                className="hover:underline cursor-pointer"
              >
                {post.author.isGroup
                  ? `r/${post.author.username}`
                  : `u/${post.author.username}`}
              </Link>
              <span>•</span>
              <span>{timeAgo}</span>
              {post.communityHandle && (
                <>
                  <span>•</span>
                  <Link
                    href={`/c/${post.communityHandle}`}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    c/{post.communityHandle}
                  </Link>
                </>
              )}
              {post.subreddit && (
                <>
                  <span>•</span>
                  <span className="text-blue-400 hover:underline cursor-pointer">
                    r/{post.subreddit}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-white text-base font-medium mb-3 cursor-pointer hover:underline line-clamp-2"
            onClick={() => router.push(`/post/${post.id}`)}
          >
            {post.title}
          </h3>

          {/* Media */}
          <div className="mb-3">
            {post.type === "image" ? (
              <div className="relative w-full max-h-[500px] rounded-lg overflow-hidden z-0">
                <div
                  className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
                  style={{ backgroundImage: `url(${post.mediaUrl})` }}
                ></div>
                <img
                  src={post.mediaUrl}
                  alt="post"
                  className="relative z-0 w-full max-h-[500px] object-contain"
                  loading="lazy"
                />
              </div>
            ) : (
              <video controls className="w-full max-h-[500px] rounded-lg bg-[#0b0c0d]">
                <source src={post.mediaUrl} type="video/mp4" />
              </video>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <button
              className="flex items-center space-x-1 hover:bg-[#272729] p-2 rounded transition-colors"
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <MessageCircle size={16} />
              <span>{post.commentsCount} Comments</span>
            </button>
            <button
  className="flex items-center space-x-1 hover:bg-[#272729] p-2 rounded transition-colors"
  onClick={() => setShowShare(true)}
>
  <Share2 size={16} />
  <span>Share</span>
</button>
            
            <button className="flex items-center space-x-1 hover:bg-[#272729] p-2 rounded transition-colors">
              <Bookmark size={16} />
              <span>Save</span>
            </button>
            {post.views && (
              <div className="flex items-center space-x-1 ml-auto">
                <Eye size={16} />
                <span>{post.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ShareModal
  open={showShare}
  onClose={() => setShowShare(false)}
  postUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.id}`}
/>

    </div>
  );
}
