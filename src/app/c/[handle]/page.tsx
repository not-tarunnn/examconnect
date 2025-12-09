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
  Community,
  getPostsByCommunity,
  Post,
} from "@/lib/communityService";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityInfo from "@/components/community/CommunityInfo";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

export default function CommunityPage() {
  const params = useParams();
  const handle = params.handle as string;
  const auth = getAuth();
  const user = auth.currentUser;
  const { collapsed } = useSidebarStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const communityData = await getCommunity(handle);
        setCommunity(communityData);

        if (
          communityData &&
          user &&
          communityData.members?.[user.uid]
        ) {
          setIsMember(true);
        }

        if (communityData?.id) {
          fetchPosts(communityData.id);
        }
      } catch (error) {
        console.error("Error fetching community:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async (communityId: string, startAfter?: any) => {
      try {
        setPostsLoading(true);
        const { posts: newPosts, lastDoc: newLastDoc } =
          await getPostsByCommunity(communityId, 10, startAfter);

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

    fetchCommunity();
  }, [handle, user]);

  const handleLoadMore = async () => {
    if (community?.id && lastDoc && hasMore) {
      const { posts: newPosts, lastDoc: newLastDoc } =
        await getPostsByCommunity(community.id, 10, lastDoc);
      setPosts((prev) => [...prev, ...newPosts]);
      setLastDoc(newLastDoc);
      setHasMore(newPosts.length === 10);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
  };

  const handleMembershipChange = (newStatus: boolean) => {
    setIsMember(newStatus);
    if (community) {
      setCommunity({
        ...community,
        memberCount: community.memberCount + (newStatus ? 1 : -1),
      });
    }
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
            <div className="text-gray-400">Loading community...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
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
                Community Not Found
              </h1>
              <p className="text-gray-400">
                The community c/{handle} does not exist.
              </p>
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

        {/* Community Header */}
        <CommunityHeader
          community={community}
          isMember={isMember}
          onMembershipChange={handleMembershipChange}
        />

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
  post={{
    ...post,
    communityHandle: handle,
    createdAt: post.createdAt || new Date(), // default if missing
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
                  No posts yet in this community
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

          {/* Sidebar - Community Info */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <CommunityInfo community={community} isMember={isMember} />
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
        defaultCommunityId={community.id}
      />
    </div>
  );
}
