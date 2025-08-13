import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  doc,
  getDoc,
} from "firebase/firestore";
import useSWRInfinite from "swr/infinite";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { PostProps } from "@/components/community/PostCard";

// Fetch user/group profile data
const fetchUserProfile = async (userId: string, isGroup: boolean = false) => {
  try {
    const userRef = doc(db, isGroup ? "groups" : "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        id: userId,
        username: userData.username || userData.name || "Anonymous",
        profilePic: userData.profilePic || userData.avatar || null,
        isGroup,
      };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  return {
    id: userId,
    username: "Anonymous",
    profilePic: null,
    isGroup,
  };
};

// Fetch paginated posts from Firestore
const fetchPosts = async (
  pageIndex: number,
  previousPageData: { posts: PostProps[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null } | null
): Promise<{ posts: PostProps[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  const postsRef = collection(db, "posts");
  let postsQuery = query(postsRef, orderBy("createdAt", "desc"), limit(10));

  // If this is not the first page, start after the last doc of previous page
  if (previousPageData && previousPageData.lastDoc) {
    postsQuery = query(postsRef, orderBy("createdAt", "desc"), startAfter(previousPageData.lastDoc), limit(10));
  }

  const snapshot = await getDocs(postsQuery);

  // Inside fetchPosts mapping:
const postsWithAuthors = await Promise.all(
  snapshot.docs.map(async (docSnap: QueryDocumentSnapshot<DocumentData>) => {
    const data = docSnap.data();

    // ✅ get the correct author UID
    const authorUid =
      data.author?.id || data.authorId || data.userId || "anonymous";

    const author = await fetchUserProfile(
      authorUid,
      data.isGroupPost || false
    );

    return {
      id: docSnap.id,
      title: data.title,
      mediaUrl: data.mediaUrl,
      type: data.type,
      reactions: data.reactions || { likes: 0, dislikes: 0 },
      commentsCount: data.commentsCount || 0,
      views: data.views || 0,
      author,
      createdAt: data.createdAt,
      subreddit: data.subreddit || data.group,
    } as PostProps;
  })
);

  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { posts: postsWithAuthors, lastDoc };
};

export function usePosts() {
  const [hasMore, setHasMore] = useState(true);

  const getKey = (
    pageIndex: number,
    previousPageData: { posts: PostProps[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null } | null
  ) => {
    if (previousPageData && previousPageData.posts.length === 0) return null; // Stop if no more posts
    return `posts-page-${pageIndex}`;
  };

  const {
    data,
    size,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite(getKey, fetchPosts, {
    onSuccess(data) {
      // Update hasMore when last fetch has no posts
      const lastPage = data[data.length - 1];
      if (lastPage && lastPage.posts.length < 10) {
        setHasMore(false);
      }
    },
  });

  const posts: PostProps[] = data ? data.flatMap(page => page.posts) : [];

  return {
    posts,
    hasMore,
    loadMore: () => {
      if (hasMore) setSize(size + 1);
    },
    isValidating,
    isLoading,
  };
}
