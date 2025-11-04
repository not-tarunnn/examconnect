"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import { ChevronUp, ChevronDown, Trash } from "lucide-react";
import CommentInput from "./CommentInput";

export type CommentDoc = {
  id: string;
  postId?: string;
  userId: string;
  text: string;
  attachments?: Array<{ base64: string; mime: string; filename: string }> | null;
  createdAt: any;
  updatedAt: any;
  likesCount: number;
};

export default function CommentItem({ comment }: { comment: CommentDoc }) {
  const { user } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [replies, setReplies] = useState<CommentDoc[]>([]);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [myVote, setMyVote] = useState<number>(0);

  // load author
  useEffect(() => {
    if (!comment?.userId) return;
    const load = async () => {
      const s = await getDoc(doc(db, "users", comment.userId));
      setAuthor(s.exists() ? s.data() : null);
    };
    void load();
  }, [comment?.userId]);

  // subscribe replies
  useEffect(() => {
    const r = collection(db, "comments", comment.id, "replies");
    const unsub = onSnapshot(r, (snap) => {
      const items: CommentDoc[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
      items.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setReplies(items);
    });
    return () => unsub();
  }, [comment.id]);

  // subscribe my vote
  useEffect(() => {
    if (!user?.uid) return;
    const vref = doc(db, "comments", comment.id, "votes", user.uid);
    const unsub = onSnapshot(vref, (snap) => {
      setMyVote(snap.exists() ? (snap.data() as any).value || 0 : 0);
    });
    return () => unsub();
  }, [user?.uid, comment.id]);

  const createdText = useMemo(() => {
    try {
      const ms = comment.createdAt?.toMillis ? comment.createdAt.toMillis() : Date.parse(comment.createdAt);
      if (!ms) return "";
      const diff = Date.now() - ms;
      const mins = Math.max(1, Math.floor(diff / 60000));
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return "";
    }
  }, [comment.createdAt]);

  const vote = async (value: 1 | 0 | -1) => {
    if (!user?.uid) return alert("Please log in to vote.");
    const cRef = doc(db, "comments", comment.id);
    const vRef = doc(db, "comments", comment.id, "votes", user.uid);

    await runTransaction(db, async (tx) => {
      const cSnap = await tx.get(cRef);
      if (!cSnap.exists()) throw new Error("Missing comment");
      const current = (cSnap.data() as any).likesCount || 0;

      const vSnap = await tx.get(vRef);
      const prevVal = vSnap.exists() ? ((vSnap.data() as any).value as number) : 0;
      let nextVal = current;

      // remove previous effect
      if (prevVal === 1) nextVal -= 1;
      if (prevVal === -1) nextVal += 1;

      // apply new
      if (value === 1) nextVal += 1;
      if (value === -1) nextVal -= 1;

      tx.update(cRef, { likesCount: nextVal });
      if (value === 0) {
        tx.set(vRef, { value: 0 });
      } else {
        tx.set(vRef, { value });
      }
    });
  };

  const score = comment.likesCount || 0;

  const deleteOwnComment = async () => {
    if (!user?.uid || user.uid !== comment.userId) return;
    try {
      const votesSnap = await getDocs(collection(db, "comments", comment.id, "votes"));
      await Promise.all(votesSnap.docs.map((d) => deleteDoc(d.ref)));
      const repliesSnap = await getDocs(collection(db, "comments", comment.id, "replies"));
      for (const r of repliesSnap.docs) {
        const rVotes = await getDocs(collection(db, "comments", comment.id, "replies", r.id, "votes"));
        await Promise.all(rVotes.docs.map((d) => deleteDoc(d.ref)));
        await deleteDoc(r.ref);
      }
      await deleteDoc(doc(db, "comments", comment.id));
    } catch (e) {
      console.error("Failed to delete comment", e);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <button className={`p-1 rounded hover:bg-white/10 ${myVote === 1 ? "text-green-400" : "text-zinc-400"}`} onClick={() => vote(myVote === 1 ? 0 : 1)}>
            <ChevronUp size={16} />
          </button>
          <span className="text-xs text-zinc-400">{score}</span>
          <button className={`p-1 rounded hover:bg-white/10 ${myVote === -1 ? "text-orange-400" : "text-zinc-400"}`} onClick={() => vote(myVote === -1 ? 0 : -1)}>
            <ChevronDown size={16} />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <img src={author?.profilePic || "/avatar.png"} alt={author?.username || "user"} className="w-6 h-6 rounded-full object-cover" />
            <span className="text-sm text-white font-medium">{author?.username || author?.fullName || "Anonymous"}</span>
            <span className="text-xs text-zinc-500">• {createdText}</span>
          </div>
          <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words">{comment.text}</div>
          {Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {comment.attachments.map((a, i) => (
                <img key={i} src={`data:${a.mime};base64,${a.base64}`} alt={a.filename} className="w-24 h-24 rounded object-cover border border-white/10" />
              ))}
            </div>
          )}
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-3">
            {user?.uid === comment.userId && (
              <button className="inline-flex items-center gap-1 hover:text-red-400" onClick={deleteOwnComment} aria-label="Delete comment">
                <Trash size={14} />
                <span>Delete</span>
              </button>
            )}
            <button className="hover:text-white" onClick={() => setShowReplyBox((s) => !s)}>Reply</button>
          </div>
          {showReplyBox && (
            <div className="mt-2 ml-8">
              <CommentInput postId={comment.postId || ""} parentCommentId={comment.id} onSubmittedAction={() => setShowReplyBox(false)} />
            </div>
          )}
          {replies.length > 0 && (
            <div className="mt-3 ml-8 border-l border-white/10 pl-4">
              {replies.map((r) => (
                <div key={r.id} className="mb-3">
                  <ReplyItem parentId={comment.id} reply={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ parentId, reply }: { parentId: string; reply: CommentDoc }) {
  const { user } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [myVote, setMyVote] = useState<number>(0);

  useEffect(() => {
    if (!reply?.userId) return;
    const load = async () => {
      const s = await getDoc(doc(db, "users", reply.userId));
      setAuthor(s.exists() ? s.data() : null);
    };
    void load();
  }, [reply?.userId]);

  useEffect(() => {
    if (!user?.uid) return;
    const vref = doc(db, "comments", parentId, "replies", reply.id, "votes", user.uid);
    const unsub = onSnapshot(vref, (snap) => {
      setMyVote(snap.exists() ? (snap.data() as any).value || 0 : 0);
    });
    return () => unsub();
  }, [user?.uid, parentId, reply.id]);

  const vote = async (value: 1 | 0 | -1) => {
    if (!user?.uid) return alert("Please log in to vote.");
    const cRef = doc(db, "comments", parentId, "replies", reply.id);
    const vRef = doc(db, "comments", parentId, "replies", reply.id, "votes", user.uid);

    await runTransaction(db, async (tx) => {
      const cSnap = await tx.get(cRef);
      if (!cSnap.exists()) throw new Error("Missing reply");
      const current = (cSnap.data() as any).likesCount || 0;

      const vSnap = await tx.get(vRef);
      const prevVal = vSnap.exists() ? ((vSnap.data() as any).value as number) : 0;
      let nextVal = current;

      if (prevVal === 1) nextVal -= 1;
      if (prevVal === -1) nextVal += 1;

      if (value === 1) nextVal += 1;
      if (value === -1) nextVal -= 1;

      tx.update(cRef, { likesCount: nextVal });
      tx.set(vRef, { value });
    });
  };

  const score = reply.likesCount || 0;

  const deleteOwnReply = async () => {
    if (!user?.uid || user.uid !== reply.userId) return;
    try {
      const votesSnap = await getDocs(collection(db, "comments", parentId, "replies", reply.id, "votes"));
      await Promise.all(votesSnap.docs.map((d) => deleteDoc(d.ref)));
      await deleteDoc(doc(db, "comments", parentId, "replies", reply.id));
    } catch (e) {
      console.error("Failed to delete reply", e);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <button className={`p-1 rounded hover:bg-white/10 ${myVote === 1 ? "text-green-400" : "text-zinc-400"}`} onClick={() => vote(myVote === 1 ? 0 : 1)}>
          <ChevronUp size={16} />
        </button>
        <span className="text-xs text-zinc-400">{score}</span>
        <button className={`p-1 rounded hover:bg-white/10 ${myVote === -1 ? "text-orange-400" : "text-zinc-400"}`} onClick={() => vote(myVote === -1 ? 0 : -1)}>
          <ChevronDown size={16} />
        </button>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <img src={author?.profilePic || "/avatar.png"} alt={author?.username || "user"} className="w-5 h-5 rounded-full object-cover" />
          <span className="text-xs text-white font-medium">{author?.username || author?.fullName || "Anonymous"}</span>
        </div>
        <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words">{reply.text}</div>
        {Array.isArray(reply.attachments) && reply.attachments.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {reply.attachments.map((a, i) => (
              <img key={i} src={`data:${a.mime};base64,${a.base64}`} alt={a.filename} className="w-20 h-20 rounded object-cover border border-white/10" />
            ))}
          </div>
        )}
        <div className="mt-2 text-xs text-zinc-400 flex items-center gap-3">
          {user?.uid === reply.userId && (
            <button className="inline-flex items-center gap-1 hover:text-red-400" onClick={deleteOwnReply} aria-label="Delete reply">
              <Trash size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
