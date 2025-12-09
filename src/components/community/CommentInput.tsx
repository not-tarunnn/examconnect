"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import AttachmentPicker from "@/components/message/AttachmentPicker";
import { createComment, getPost } from "@/lib/communityService";

type Props = {
  postId: string;
  parentCommentId?: string | null;
  onSubmittedAction?: () => void;
};

export default function CommentInput({ postId, parentCommentId = null, onSubmittedAction }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Array<{ base64: string; mime: string; filename: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const addAttachment = (base64: string, mime: string, filename: string) => {
    setAttachments((prev) => [...prev, { base64, mime, filename }]);
  };
  const removeAttachment = (idx: number) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!user) return alert("Please log in to comment.");
    const content = text.trim();
    if (!content && attachments.length === 0) return;
    setSubmitting(true);
    try {
      if (parentCommentId) {
        // For replies, use the old system for now (nested collection approach)
        await addDoc(collection(db, "comments", parentCommentId, "replies"), {
          userId: user.uid,
          text: content,
          attachments: attachments.length ? attachments : null,
          createdAt: serverTimestamp(),
          updatedAt: null,
          likesCount: 0,
        });
      } else {
        // For top-level comments, fetch post info and use new system
        const post = await getPost(postId);

        if (post) {
          await createComment({
            text: content,
            author: {
              id: user.uid,
              username: user.displayName || user.email?.split("@")[0] || "Anonymous",
            },
            postId,
            communityId: post.communityId,
            reactions: { likes: 0, dislikes: 0 },
            id: ""
          });
        } else {
          // Fallback for posts not in new system
          await addDoc(collection(db, "comments"), {
            postId,
            userId: user.uid,
            text: content,
            attachments: attachments.length ? attachments : null,
            createdAt: serverTimestamp(),
            updatedAt: null,
            likesCount: 0,
          });
        }
      }
      setText("");
      setAttachments([]);
      onSubmittedAction && onSubmittedAction();
    } catch (e) {
      console.error("Failed to add comment:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentCommentId ? "Write a reply" : "What are your thoughts?"}
        className="w-full bg-transparent outline-none text-sm text-zinc-100 placeholder-zinc-500 resize-y min-h-[80px]"
      />
      {attachments.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative">
              <img
                src={`data:${att.mime};base64,${att.base64}`}
                alt={att.filename}
                className="w-20 h-20 object-cover rounded border border-white/10"
              />
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black/70 text-white text-[10px] leading-5 text-center"
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <AttachmentPicker onUploadAction={(base64, mime, filename) => addAttachment(base64, mime, filename)} />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          {submitting ? "Posting..." : parentCommentId ? "Reply" : "Comment"}
        </button>
      </div>
    </div>
  );
}
