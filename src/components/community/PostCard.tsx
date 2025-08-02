"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";

// ✅ Exported type so it can be reused
export type PostProps = {
  id: string;
  title: string;
  mediaUrl: string;
  type: "image" | "video";
  reactions: { likes: number; dislikes: number };
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
  const timeAgo = post.createdAt ? formatDistanceToNow(post.createdAt.toDate?.() || new Date(post.createdAt), { addSuffix: true }) : "just now";

  return (
    <div className="bg-transparent rounded-lg mb-4 hover:bg-[#202020] transition-colors duration-200 group">
      {/* Vote Section */}
      <div className="flex">
        <div className="flex flex-col items-center bg-transparent p-2 rounded-l-lg">
          <button className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-green-500 transition-colors">
            <ChevronUp size={20} />
          </button>
          <span className="text-xs font-medium text-white px-1">
            {post.reactions.likes - post.reactions.dislikes}
          </span>
          <button className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-orange-500 transition-colors">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3">
          {/* Post Header */}
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <div className="flex items-center space-x-2">
              {/* <img
                src={post.author.profilePic || "/api/placeholder/24/24"}
                alt={post.author.username}
                className="w-5 h-5 rounded-full bg-gray-600"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/24/24";
                }}
              /> */}
              <span className="hover:underline cursor-pointer">
                {post.author.isGroup ? `r/${post.author.username}` : `u/${post.author.username}`}
              </span>
              <span>•</span>
              <span>{timeAgo}</span>
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
              <div className="relative w-full max-h-[500px] rounded-lg overflow-hidden">
            {/* Blurred background */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
              style={{ backgroundImage: `url(${post.mediaUrl})` }}
            ></div>
          
            {/* Actual image */}
           <img
              src={post.mediaUrl}
             alt="post"
              className="relative z-10 w-full max-h-[500px] object-contain"
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
            <button className="flex items-center space-x-1 hover:bg-[#272729] p-2 rounded transition-colors">
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
    </div>
  );
}
