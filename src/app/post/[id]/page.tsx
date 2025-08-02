"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark, Eye, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import SuggestedGroups from "@/components/community/SuggestedGroups";
import CopyrightFooter from "@/components/community/CopyrightFooter";
import { useSidebarStore } from "@/store/useSidebarStore";

// Mock post data - in real app this would come from your Firebase query
const mockPost = {
  id: "1",
  title: "Japan right now as Tsunami waves begin",
  mediaUrl: "https://cdn.builder.io/api/v1/image/assets%2F00c7306302ae438d972f184e5d147a49%2F0c16a843db024c7098d613fccec19dc5?format=webp&width=800",
  type: "image" as const,
  reactions: { likes: 1247, dislikes: 23 },
  commentsCount: 573,
  views: 15420,
  author: {
    id: "user1",
    username: "newsreporter24",
    profilePic: "/api/placeholder/32/32",
    isGroup: false,
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  subreddit: "worldnews",
  description: "Breaking news: Tsunami waves are beginning to hit the coastline of Japan following a major earthquake. Emergency services have been mobilized and evacuation procedures are in effect for coastal areas.",
};

// Mock comments data
const mockComments = [
  {
    id: "1",
    author: {
      username: "AutoModerator",
      profilePic: "/api/placeholder/24/24",
      role: "MOD",
    },
    content: "This is a developing story. Please stick to verified information from reliable news sources.",
    timeAgo: "2h ago",
    votes: 0,
    replies: [],
    stickied: true,
  },
  {
    id: "2",
    author: {
      username: "Just_Panda_2573",
      profilePic: "/api/placeholder/24/24",
    },
    content: "If both teams are playing on the same pitch, shouldn't both coaches have equal access to it?",
    timeAgo: "2h ago",
    votes: 60,
    replies: [
      {
        id: "2-1",
        author: {
          username: "Least_Cap_7441",
          profilePic: "/api/placeholder/24/24",
        },
        content: "No that's against the spirit of the cricket sir.",
        timeAgo: "2h ago",
        votes: 68,
        replies: [],
      }
    ],
  },
  {
    id: "3",
    author: {
      username: "sickhomiee",
      profilePic: "/api/placeholder/24/24",
    },
    content: "Gambhir is fighting for the country meanwhile our countrymen :",
    timeAgo: "2h ago",
    votes: 17,
    replies: [],
  },
];

const CommentComponent = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => {
  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-[#343536] pl-4' : ''} mb-4`}>
      <div className="flex space-x-3">
        <div className="flex flex-col items-center space-y-1">
          <button className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-orange-500 transition-colors">
            <ChevronUp size={16} />
          </button>
          <span className="text-xs text-gray-400">{comment.votes}</span>
          <button className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-blue-500 transition-colors">
            <ChevronDown size={16} />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={comment.author.profilePic}
              alt={comment.author.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white font-medium text-sm">{comment.author.username}</span>
            {comment.author.role && (
              <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                {comment.author.role}
              </span>
            )}
            <span className="text-gray-400 text-sm">• {comment.timeAgo}</span>
            {comment.stickied && (
              <span className="text-green-400 text-xs">📌 Stickied comment</span>
            )}
          </div>
          
          <p className="text-gray-200 text-sm mb-2">{comment.content}</p>
          
          <div className="flex items-center space-x-4 text-gray-400 text-xs">
            <button className="hover:text-white transition-colors">Reply</button>
            <button className="hover:text-white transition-colors">Award</button>
            <button className="hover:text-white transition-colors">Share</button>
          </div>
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply: any) => (
                <CommentComponent key={reply.id} comment={reply} isReply={true} />
              ))}
              {comment.replies.length > 1 && (
                <button className="text-blue-400 text-sm hover:underline mt-2">
                  {comment.replies.length - 1} more replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const { collapsed } = useSidebarStore();
  const [sortBy, setSortBy] = useState("Best");
  
  const timeAgo = formatDistanceToNow(mockPost.createdAt, { addSuffix: true });

  return (
    <div className="flex min-h-screen bg-[#0b0c0d] text-white">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20">
          <HeaderApp />
        </div>

        {/* Content Layout */}
        <main className="flex flex-1 pt-4 px-4 gap-16 max-w-7xl mx-auto w-full">
          {/* Post Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to community</span>
            </button>

            {/* Post */}
            <div className="bg-transparent rounded-lg mb-6">
              <div className="flex">
                {/* Vote Section */}
                <div className="flex flex-col items-center bg-transparent p-3 rounded-l-lg">
                  <button className="p-2 hover:bg-[#343536] rounded text-gray-400 hover:text-orange-500 transition-colors">
                    <ChevronUp size={24} />
                  </button>
                  <span className="text-sm font-medium text-white px-1 py-2">
                    {mockPost.reactions.likes - mockPost.reactions.dislikes}
                  </span>
                  <button className="p-2 hover:bg-[#343536] rounded text-gray-400 hover:text-blue-500 transition-colors">
                    <ChevronDown size={24} />
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4">
                  {/* Post Header */}
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <img
                      src={mockPost.author.profilePic}
                      alt={mockPost.author.username}
                      className="w-6 h-6 rounded-full bg-gray-600 mr-2"
                    />
                    <span className="hover:underline cursor-pointer mr-2">
                      r/{mockPost.subreddit}
                    </span>
                    <span>Posted by</span>
                    <span className="hover:underline cursor-pointer mx-1">
                      u/{mockPost.author.username}
                    </span>
                    <span>{timeAgo}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-white text-xl font-medium mb-4">
                    {mockPost.title}
                  </h1>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {mockPost.description}
                  </p>

                  {/* Media */}
                  <div className="mb-4">
                    <img 
                      src={mockPost.mediaUrl} 
                      alt="post" 
                      className="w-full max-h-[600px] object-contain rounded-lg bg-[#0b0c0d]"
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center space-x-6 text-gray-400 text-sm border-b border-[#343536] pb-4">
                    <button className="flex items-center space-x-2 hover:bg-[#272729] p-2 rounded transition-colors">
                      <MessageCircle size={18} />
                      <span>{mockPost.commentsCount} Comments</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:bg-[#272729] p-2 rounded transition-colors">
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:bg-[#272729] p-2 rounded transition-colors">
                      <Bookmark size={18} />
                      <span>Save</span>
                    </button>
                    <div className="flex items-center space-x-2 ml-auto">
                      <Eye size={18} />
                      <span>{mockPost.views?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div className="bg-transparent">
              {/* Comment Input */}
              <div className="mb-6">
                <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-4">
                  <textarea
                    placeholder="Join the conversation"
                    className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4 mb-4 text-sm">
                <span className="text-gray-400">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1a1b] border border-[#343536] rounded px-3 py-1 text-white"
                >
                  <option>Best</option>
                  <option>Top</option>
                  <option>New</option>
                  <option>Controversial</option>
                  <option>Old</option>
                </select>
              </div>

              {/* Comments */}
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <CommentComponent key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0 ml-auto">
            <SuggestedGroups />
          </div>
        </main>

        {/* Copyright Footer */}
        <CopyrightFooter />
      </div>
    </div>
  );
}
