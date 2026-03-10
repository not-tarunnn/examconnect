"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // your firebase config
import { doc, getDoc } from "firebase/firestore";
import { MessageCircle, Share2, Bookmark, Eye, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import SuggestedGroups from "@/components/community/SuggestedGroups";
import CopyrightFooter from "@/components/community/CopyrightFooter";
import CommentInput from "@/components/community/CommentInput";
import CommentThread from "@/components/community/CommentThread";
import { useSidebarStore } from "@/store/useSidebarStore";


export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const { collapsed } = useSidebarStore();
  const [sortBy, setSortBy] = useState("Best");

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const postRef = doc(db, "posts", params.id as string);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = { id: postSnap.id, ...postSnap.data() };
          setPost(postData);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  if (!post) {
    return <div className="text-white p-4">Post not found</div>;
  }

  const timeAgo = post.createdAt?.toDate
    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
    : "";

  return (
    <div className="flex min-h-screen bg-[#181818] text-white">
      {/* Sidebar - Overlay on mobile, fixed on desktop */}
      <div className="sm:fixed sm:top-0 sm:left-0 sm:h-screen sm:z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 w-full sm:w-auto ${collapsed ? "sm:ml-20" : "sm:ml-64"}`}>
        <div className="sticky top-0 z-20">
          <HeaderApp />
        </div>

        <main className="flex flex-col lg:flex-row flex-1 pt-2 sm:pt-4 px-2 sm:px-4 gap-4 sm:gap-16 max-w-7xl mx-auto w-full">
          {/* Post Content */}
          <div className="flex-1 min-w-0 w-full lg:max-w-3xl">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span>Back</span>
            </button>

            <div className="bg-transparent rounded-lg mb-6">
              <div className="flex flex-col sm:flex-row">
                {/* Vote Section - Hidden on mobile, shown on sm+ */}
                <div className="hidden sm:flex sm:flex-col items-center bg-transparent p-3 rounded-l-lg">
                  <ChevronUp size={24} />
                  <span className="text-sm font-medium text-white px-1 py-2">
                    {post.reactions?.likes - post.reactions?.dislikes || 0}
                  </span>
                  <ChevronDown size={24} />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-2 sm:p-4">
                  {/* Header Info */}
                  <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author?.profilePic || "/api/placeholder/32/32"}
                        alt={post.author?.username || "Anonymous"}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-600"
                      />
                      <span className="hover:underline cursor-pointer">
                        {post.subreddit || "community"}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">Posted by</span>
                      <span className="hover:underline cursor-pointer">
                        {post.author?.username || "Anonymous"}
                      </span>
                    </div>
                    <span className="sm:hidden text-xs">{timeAgo}</span>
                    <span className="hidden sm:inline">{timeAgo}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-white text-lg sm:text-2xl font-medium mb-2 sm:mb-4">{post.title}</h1>

                  {/* Description */}
                  <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">{post.description}</p>

                  {/* Media */}
                  {post.mediaUrl && (
                    <img
                      src={post.mediaUrl}
                      alt="post"
                      className="w-full max-h-[300px] sm:max-h-[600px] object-contain rounded-lg bg-[#0b0c0d] mb-3 sm:mb-4"
                    />
                  )}

                  {/* Mobile Vote Buttons */}
                  <div className="flex sm:hidden items-center justify-between gap-2 text-gray-400 text-xs mb-3 pb-3 border-b border-[#343536]">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 hover:bg-[#343536] px-2 py-1 rounded transition-colors">
                        <ChevronUp size={16} />
                        <span>{post.reactions?.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:bg-[#343536] px-2 py-1 rounded transition-colors">
                        <ChevronDown size={16} />
                        <span>{post.reactions?.dislikes || 0}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 hover:bg-[#272729] px-2 py-1 rounded transition-colors">
                        <MessageCircle size={14} />
                      </button>
                      <button className="flex items-center gap-1 hover:bg-[#272729] px-2 py-1 rounded transition-colors">
                        <Share2 size={14} />
                      </button>
                      <button className="flex items-center gap-1 hover:bg-[#272729] px-2 py-1 rounded transition-colors">
                        <Bookmark size={14} />
                      </button>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{post.views?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Action Bar */}
                  <div className="hidden sm:flex items-center gap-6 text-gray-400 text-sm border-b border-[#343536] pb-4 mb-4">
                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                      <MessageCircle size={18} />
                      <span>Comments</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                      <Share2 size={18} />
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                      <Bookmark size={18} />
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                      <Eye size={18} />
                      <span>{post.views?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Comment box */}
                  <div className="mt-4">
                    <CommentInput postId={post.id} />
                  </div>

                  {/* Thread */}
                  <div className="mt-6">
                    <CommentThread postId={post.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Groups - Hidden on mobile */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <SuggestedGroups />
          </div>
        </main>

        <CopyrightFooter />
      </div>
    </div>
  );
}
