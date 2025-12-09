"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import Footer from "@/components/community/FooterCom";
import CopyrightFooter from "@/components/community/CopyrightFooter";
import { useSidebarStore } from "@/store/useSidebarStore";
import {
  getCommunity,
  getSubcommunity,
  Community,
  Subcommunity,
  getPostsBySubcommunity,
  Post,
} from "@/lib/communityService";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Edit2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SubcommunityPage() {
  const params = useParams();
  const handle = params.handle as string;
  const sub_handle = params.sub_handle as string;
  const auth = getAuth();
  const user = auth.currentUser;
  const { collapsed } = useSidebarStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [subcommunity, setSubcommunity] = useState<Subcommunity | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const communityData = await getCommunity(handle);
        setCommunity(communityData);

        if (communityData?.id) {
          const subcommunityData = await getSubcommunity(
            communityData.id,
            sub_handle
          );
          setSubcommunity(subcommunityData);

          if (user && subcommunityData?.members?.[user.uid]) {
            setIsMember(true);
          }

          if (subcommunityData?.id) {
            fetchPosts(subcommunityData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async (subcommunityId: string, startAfter?: any) => {
      try {
        setPostsLoading(true);
        const { posts: newPosts, lastDoc: newLastDoc } =
          await getPostsBySubcommunity(subcommunityId, 10, startAfter);

        if (startAfter) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        setLastDoc(newLastDoc);
        setHasMore(newPosts.length === 10);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchData();
  }, [handle, sub_handle, user]);

  const handleLoadMore = async () => {
    if (subcommunity?.id && lastDoc && hasMore) {
      const { posts: newPosts, lastDoc: newLastDoc } =
        await getPostsBySubcommunity(subcommunity.id, 10, lastDoc);
      setPosts((prev) => [...prev, ...newPosts]);
      setLastDoc(newLastDoc);
      setHasMore(newPosts.length === 10);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#161616] text-white">
        <div className="fixed top-0 left-0 h-screen z-30">
          <Sidebar />
        </div>
        <div
          className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="sticky top-0 z-20">
            <HeaderApp />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-gray-400">Loading subcommunity...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!community || !subcommunity) {
    return (
      <div className="flex min-h-screen bg-[#161616] text-white">
        <div className="fixed top-0 left-0 h-screen z-30">
          <Sidebar />
        </div>
        <div
          className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="sticky top-0 z-20">
            <HeaderApp />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Subcommunity Not Found
              </h1>
              <p className="text-gray-400 mb-4">
                The subcommunity sc/{sub_handle} does not exist.
              </p>
              <Link href={`/c/${handle}`} className="text-blue-400 hover:underline">
                Back to Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#161616] text-white">
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

        {/* Subcommunity Header */}
        <div className="bg-[#1a1a1a] border-b border-[#343536] px-4 md:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <Link
              href={`/c/${community.handle}`}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 w-fit"
            >
              <ChevronLeft size={18} />
              Back to {community.name}
            </Link>

            <div className="flex items-center gap-4 mb-4">
              {subcommunity.iconUrl ? (
                <img
                  src={subcommunity.iconUrl}
                  alt={subcommunity.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {subcommunity.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-white">
                  {subcommunity.name}
                </h1>
                <p className="text-gray-400">sc/{subcommunity.handle}</p>
              </div>
            </div>

            {subcommunity.description && (
              <p className="text-gray-300 text-base max-w-2xl">
                {subcommunity.description}
              </p>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <main className="flex flex-1 gap-6 max-w-7xl mx-auto w-full px-4 py-6">
          {/* Posts Feed */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {isMember && (
              <Button
                onClick={() => setShowCreatePost(true)}
                className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white py-6"
              >
                <Edit2 size={18} className="mr-2" />
                Create Post
              </Button>
            )}

            {posts.length > 0 ? (
              <div className="space-y-2">
                {posts.map((post) => (
                  <PostCard
  key={post.id}
  post={{
    ...post,
    createdAt: post.createdAt || new Date(),
  }}
/>
                ))}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={postsLoading}
                    className="w-full py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {postsLoading ? "Loading..." : "Load More"}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  No posts yet in this subcommunity
                </p>
                {isMember && (
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create the first post
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Copyright Footer */}
        <CopyrightFooter />

        {/* Footer */}
        <Footer />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onCloseAction={() => setShowCreatePost(false)}
      />
    </div>
  );
}
