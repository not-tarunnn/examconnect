import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  addDoc,
  serverTimestamp,
  increment,
  Query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * COMMUNITIES
 */

export interface Community {
  id?: string;
  name: string;
  handle: string; // unique identifier like "jee-mains"
  description: string;
  category: string;
  tags: string[];
  rules: string[];
  iconUrl?: string;
  bannerUrl?: string;
  createdBy: string;
  createdAt?: any;
  memberCount: number;
  isVerified: boolean;
  members?: Record<string, boolean>;
  moderators?: Record<string, boolean>;
}

export interface Subcommunity {
  id?: string;
  name: string;
  handle: string;
  description: string;
  parentCommunityId: string;
  parentCommunityHandle: string;
  iconUrl?: string;
  bannerUrl?: string;
  createdBy: string;
  createdAt?: any;
  memberCount: number;
  members?: Record<string, boolean>;
  moderators?: Record<string, boolean>;
}

export interface Post {
  id?: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  type?: "image" | "video" | "text";
  author: {
    id: string;
    username: string;
    profilePic?: string;
  };
  communityId?: string;
  communityHandle?: string;
  subcommunityId?: string;
  subcommunityHandle?: string;
  reactions: {
    likes: number;
    dislikes: number;
    likedBy?: Record<string, boolean>;
    dislikedBy?: Record<string, boolean>;
  };
  commentsCount: number;
  views: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Comment {
  id?: string;
  text: string;
  author: {
    id: string;
    username: string;
    profilePic?: string;
  };
  postId: string;
  communityId?: string;
  parentCommentId?: string;
  reactions: {
    likes: number;
    dislikes: number;
    likedBy?: Record<string, boolean>;
    dislikedBy?: Record<string, boolean>;
  };
  createdAt?: any;
  updatedAt?: any;
}

// ===== COMMUNITY CRUD =====

export async function createCommunity(community: Community): Promise<string> {
  try {
    const handle = community.handle.toLowerCase().replace(/\s+/g, "-");
    
    // Check if handle already exists
    const existingQuery = query(
      collection(db, "communities"),
      where("handle", "==", handle)
    );
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error("Community handle already exists");
    }

    const docRef = await addDoc(collection(db, "communities"), {
      ...community,
      handle,
      createdAt: serverTimestamp(),
      memberCount: 1,
      members: { [community.createdBy]: true },
      isVerified: false,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function getCommunity(handleOrId: string): Promise<Community | null> {
  try {
    let docRef;
    
    // Try to get by handle first
    const handleQuery = query(
      collection(db, "communities"),
      where("handle", "==", handleOrId.toLowerCase().replace(/\s+/g, "-"))
    );
    const handleSnapshot = await getDocs(handleQuery);
    
    if (!handleSnapshot.empty) {
      return { ...handleSnapshot.docs[0].data(), id: handleSnapshot.docs[0].id } as Community;
    }

    // Try to get by ID
    docRef = doc(db, "communities", handleOrId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Community;
    }

    return null;
  } catch (error) {
    console.error("Error getting community:", error);
    return null;
  }
}

export async function getAllCommunities(
  pageSize: number = 20,
  lastDoc?: any
): Promise<{ communities: Community[]; lastDoc: any }> {
  try {
    const constraints: QueryConstraint[] = [
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, "communities"), ...constraints);
    const snapshot = await getDocs(q);

    const communities = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Community[];

    return {
      communities,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error getting communities:", error);
    return { communities: [], lastDoc: null };
  }
}

export async function updateCommunity(id: string, updates: Partial<Community>) {
  try {
    const docRef = doc(db, "communities", id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating community:", error);
    throw error;
  }
}

export async function deleteCommunity(id: string) {
  try {
    await deleteDoc(doc(db, "communities", id));
  } catch (error) {
    console.error("Error deleting community:", error);
    throw error;
  }
}

export async function joinCommunity(communityId: string, userId: string) {
  try {
    const docRef = doc(db, "communities", communityId);
    await updateDoc(docRef, {
      [`members.${userId}`]: true,
      memberCount: increment(1),
    });
  } catch (error) {
    console.error("Error joining community:", error);
    throw error;
  }
}

export async function leaveCommunity(communityId: string, userId: string) {
  try {
    const docRef = doc(db, "communities", communityId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const members = { ...docSnap.data().members };
    delete members[userId];

    await updateDoc(docRef, {
      members,
      memberCount: increment(-1),
    });
  } catch (error) {
    console.error("Error leaving community:", error);
    throw error;
  }
}

// ===== SUBCOMMUNITY CRUD =====

export async function createSubcommunity(
  subcommunity: Subcommunity
): Promise<string> {
  try {
    const handle = subcommunity.handle.toLowerCase().replace(/\s+/g, "-");

    // Check if handle already exists under this parent
    const existingQuery = query(
      collection(db, "communities", subcommunity.parentCommunityId, "subcommunities"),
      where("handle", "==", handle)
    );
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error("Subcommunity handle already exists");
    }

    const docRef = await addDoc(
      collection(db, "communities", subcommunity.parentCommunityId, "subcommunities"),
      {
        ...subcommunity,
        handle,
        createdAt: serverTimestamp(),
        memberCount: 1,
        members: { [subcommunity.createdBy]: true },
      }
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating subcommunity:", error);
    throw error;
  }
}

export async function getSubcommunity(
  parentCommunityId: string,
  handleOrId: string
): Promise<Subcommunity | null> {
  try {
    const subcollection = collection(
      db,
      "communities",
      parentCommunityId,
      "subcommunities"
    );

    // Try handle first
    const handleQuery = query(
      subcollection,
      where("handle", "==", handleOrId.toLowerCase().replace(/\s+/g, "-"))
    );
    const handleSnapshot = await getDocs(handleQuery);

    if (!handleSnapshot.empty) {
      return {
        ...handleSnapshot.docs[0].data(),
        id: handleSnapshot.docs[0].id,
      } as Subcommunity;
    }

    // Try ID
    const docRef = doc(subcollection, handleOrId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Subcommunity;
    }

    return null;
  } catch (error) {
    console.error("Error getting subcommunity:", error);
    return null;
  }
}

export async function getSubcommunitiesByCommunity(
  parentCommunityId: string
): Promise<Subcommunity[]> {
  try {
    const q = query(
      collection(db, "communities", parentCommunityId, "subcommunities"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Subcommunity[];
  } catch (error) {
    console.error("Error getting subcommunities:", error);
    return [];
  }
}

export async function updateSubcommunity(
  parentCommunityId: string,
  subcommunityId: string,
  updates: Partial<Subcommunity>
) {
  try {
    const docRef = doc(
      db,
      "communities",
      parentCommunityId,
      "subcommunities",
      subcommunityId
    );
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating subcommunity:", error);
    throw error;
  }
}

export async function deleteSubcommunity(
  parentCommunityId: string,
  subcommunityId: string
) {
  try {
    await deleteDoc(
      doc(
        db,
        "communities",
        parentCommunityId,
        "subcommunities",
        subcommunityId
      )
    );
  } catch (error) {
    console.error("Error deleting subcommunity:", error);
    throw error;
  }
}

// ===== POST CRUD =====

export async function createPost(post: Post): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
    });

    // Update community post count
    if (post.communityId) {
      const communityRef = doc(db, "communities", post.communityId);
      await updateDoc(communityRef, {
        postCount: increment(1),
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Post;
    }

    return null;
  } catch (error) {
    console.error("Error getting post:", error);
    return null;
  }
}

export async function getPostsByCommunity(
  communityId: string,
  pageSize: number = 20,
  lastDoc?: any
): Promise<{ posts: Post[]; lastDoc: any }> {
  try {
    const constraints: QueryConstraint[] = [
      where("communityId", "==", communityId),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, "posts"), ...constraints);
    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Post[];

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error getting posts:", error);
    return { posts: [], lastDoc: null };
  }
}

export async function getPostsBySubcommunity(
  subcommunityId: string,
  pageSize: number = 20,
  lastDoc?: any
): Promise<{ posts: Post[]; lastDoc: any }> {
  try {
    const constraints: QueryConstraint[] = [
      where("subcommunityId", "==", subcommunityId),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, "posts"), ...constraints);
    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Post[];

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error getting posts:", error);
    return { posts: [], lastDoc: null };
  }
}

export async function updatePost(postId: string, updates: Partial<Post>) {
  try {
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function incrementPostViews(postId: string) {
  try {
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}

export async function deletePost(postId: string) {
  try {
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// ===== COMMENT CRUD =====

export async function createComment(comment: Comment): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      ...comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update post comment count
    const postRef = doc(db, "posts", comment.postId);
    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

export async function getComment(commentId: string): Promise<Comment | null> {
  try {
    const docRef = doc(db, "comments", commentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Comment;
    }

    return null;
  } catch (error) {
    console.error("Error getting comment:", error);
    return null;
  }
}

export async function getCommentsByPost(
  postId: string,
  pageSize: number = 50,
  lastDoc?: any
): Promise<{ comments: Comment[]; lastDoc: any }> {
  try {
    const constraints: QueryConstraint[] = [
      where("postId", "==", postId),
      where("parentCommentId", "==", null),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, "comments"), ...constraints);
    const snapshot = await getDocs(q);

    const comments = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Comment[];

    return {
      comments,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error getting comments:", error);
    return { comments: [], lastDoc: null };
  }
}

export async function getReplies(
  parentCommentId: string
): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, "comments"),
      where("parentCommentId", "==", parentCommentId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Comment[];
  } catch (error) {
    console.error("Error getting replies:", error);
    return [];
  }
}

export async function updateComment(commentId: string, updates: Partial<Comment>) {
  try {
    const docRef = doc(db, "comments", commentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    await deleteDoc(doc(db, "comments", commentId));

    // Update post comment count
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1),
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

export async function voteComment(
  commentId: string,
  userId: string,
  voteType: "like" | "dislike" | null
) {
  try {
    const docRef = doc(db, "comments", commentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const reactions = data.reactions || { likes: 0, dislikes: 0 };
    const likedBy = reactions.likedBy || {};
    const dislikedBy = reactions.dislikedBy || {};

    const updates: Record<string, any> = {};

    if (voteType === "like") {
      if (likedBy[userId]) {
        delete likedBy[userId];
        updates["reactions.likes"] = increment(-1);
      } else {
        if (dislikedBy[userId]) {
          delete dislikedBy[userId];
          updates["reactions.dislikes"] = increment(-1);
        }
        likedBy[userId] = true;
        updates["reactions.likes"] = increment(1);
      }
    } else if (voteType === "dislike") {
      if (dislikedBy[userId]) {
        delete dislikedBy[userId];
        updates["reactions.dislikes"] = increment(-1);
      } else {
        if (likedBy[userId]) {
          delete likedBy[userId];
          updates["reactions.likes"] = increment(-1);
        }
        dislikedBy[userId] = true;
        updates["reactions.dislikes"] = increment(1);
      }
    }

    updates["reactions.likedBy"] = likedBy;
    updates["reactions.dislikedBy"] = dislikedBy;

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error voting on comment:", error);
    throw error;
  }
}
