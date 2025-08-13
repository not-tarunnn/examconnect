"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // your firebase config
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark, Eye, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import SuggestedGroups from "@/components/community/SuggestedGroups";
import CopyrightFooter from "@/components/community/CopyrightFooter";
import { useSidebarStore } from "@/store/useSidebarStore";

const CommentComponent = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => {
  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-[#343536] pl-4' : ''} mb-4`}>
      <div className="flex space-x-3">
        <div className="flex flex-col items-center space-y-1">
          <button className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-orange-500 transition-colors">
            <ChevronUp size={16} />
          </button>
          <span className="text-xs text-gray-400">{comment.votes || 0}</span>
          <button className="p-1 hover:bg-[#343536] rounded text-gray-400 hover:text-blue-500 transition-colors">
            <ChevronDown size={16} />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={comment.author?.profilePic || "/api/placeholder/24/24"}
              alt={comment.author?.username || "Anonymous"}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white font-medium text-sm">{comment.author?.username || "Anonymous"}</span>
            <span className="text-gray-400 text-sm">• {comment.timeAgo}</span>
          </div>
          
          <p className="text-gray-200 text-sm mb-2">{comment.content}</p>
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

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
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

          // Fetch comments
          const commentsRef = collection(db, "posts", params.id as string, "comments");
          const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
          const commentsSnap = await getDocs(commentsQuery);

          const commentList = commentsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timeAgo: formatDistanceToNow(doc.data().createdAt?.toDate?.() || new Date(), { addSuffix: true })
          }));

          setComments(commentList);
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
    <div className="flex min-h-screen bg-[#0b0c0d] text-white">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="sticky top-0 z-20">
          <HeaderApp />
        </div>

        <main className="flex flex-1 pt-4 px-4 gap-16 max-w-7xl mx-auto w-full">
          {/* Post Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to community</span>
            </button>

            <div className="bg-transparent rounded-lg mb-6">
              <div className="flex">
                {/* Vote Section */}
                <div className="flex flex-col items-center bg-transparent p-3 rounded-l-lg">
                  <ChevronUp size={24} />
                  <span className="text-sm font-medium text-white px-1 py-2">
                    {post.reactions?.likes - post.reactions?.dislikes || 0}
                  </span>
                  <ChevronDown size={24} />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <img
                      src={post.author?.profilePic || "/api/placeholder/32/32"}
                      alt={post.author?.username || "Anonymous"}
                      className="w-6 h-6 rounded-full bg-gray-600 mr-2"
                    />
                    <span className="hover:underline cursor-pointer mr-2">
                      r/{post.subreddit || "community"}
                    </span>
                    <span>Posted by</span>
                    <span className="hover:underline cursor-pointer mx-1">
                      u/{post.author?.username || "Anonymous"}
                    </span>
                    <span>{timeAgo}</span>
                  </div>

                  <h1 className="text-white text-xl font-medium mb-4">{post.title}</h1>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.description}</p>

                  {post.mediaUrl && (
                    <img
                      src={post.mediaUrl}
                      alt="post"
                      className="w-full max-h-[600px] object-contain rounded-lg bg-[#0b0c0d]"
                    />
                  )}

                  <div className="flex items-center space-x-6 text-gray-400 text-sm border-b border-[#343536] pb-4">
                    <MessageCircle size={18} />
                    <span>{comments.length} Comments</span>
                    <Share2 size={18} />
                    <Bookmark size={18} />
                    <Eye size={18} />
                    <span>{post.views?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              {comments.map(comment => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          </div>

          <div className="hidden lg:block w-72 flex-shrink-0 ml-auto">
            <SuggestedGroups />
          </div>
        </main>

        <CopyrightFooter />
      </div>
    </div>
  );
}
