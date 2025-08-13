"use client";

import { usePosts } from "@/hooks/usePosts";
import PostCard from "@/components/community/PostCard";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

export default function PostFeed() {
  const { posts, isValidating, isLoading, hasMore } = usePosts(); // <-- hasMore from hook
  const loadingRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const loadMore = async (): Promise<void> => {
  }
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isValidating &&
        hasMore && // <-- stop if no more posts
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true;
        loadMore().finally(() => {
          isFetchingRef.current = false;
        });
      }
    },
    [loadMore, isValidating, hasMore]
  );

  useEffect(() => {
    if (!loadingRef.current || !hasMore) return; // <-- don't observe if no more data

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, hasMore]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Loading posts...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No posts available yet.</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post.id}>
              <PostCard post={post} />
            </div>
          ))}

          {hasMore && (
            <div
              ref={loadingRef}
              className="flex justify-center items-center py-4 min-h-[60px]"
            >
              {isValidating ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more posts...</span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Scroll to load more posts
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
