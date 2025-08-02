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
  previousPageData: PostProps[] | null
): Promise<PostProps[]> => {
  const postsRef = collection(db, "posts");
  let postsQuery = query(postsRef, orderBy("createdAt", "desc"), limit(10));

  // If this is not the first page, use startAfter
  if (previousPageData && previousPageData.length > 0) {
    const lastPost = previousPageData[previousPageData.length - 1];

    // Get the last document snapshot for startAfter
    const snapshot = await getDocs(
      query(postsRef, orderBy("createdAt", "desc"), limit(10))
    );

    const lastDoc = snapshot.docs.find((doc) => doc.id === lastPost.id);

    if (lastDoc) {
      postsQuery = query(postsRef, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(10));
    }
  }

  const snapshot = await getDocs(postsQuery);

  // Fetch posts with author information
  const postsWithAuthors = await Promise.all(
    snapshot.docs.map(async (doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();

      // Fetch author profile
      const author = await fetchUserProfile(
        data.authorId || data.userId || "anonymous",
        data.isGroupPost || false
      );

      return {
        id: doc.id,
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

  return postsWithAuthors;
};

// Hook to use in your app
export function usePosts() {
  const getKey = (pageIndex: number, previousPageData: PostProps[] | null) => {
    if (previousPageData && previousPageData.length === 0) return null; // No more pages
    return `posts-page-${pageIndex}`; // Cache key
  };

  const {
    data,
    size,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite<PostProps[]>(getKey, fetchPosts);

  const posts: PostProps[] = data ? data.flat() : [];

  return {
    posts,
    loadMore: () => setSize(size + 1),
    isValidating,
    isLoading,
  };
}
