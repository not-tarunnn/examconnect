"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CommentItem, { CommentDoc } from "./CommentItem";

export default function CommentThread({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentDoc[]>([]);

  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: CommentDoc[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      setComments(items);
    });
    return () => unsub();
  }, [postId]);

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}
    </div>
  );
}
