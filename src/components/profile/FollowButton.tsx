"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function FollowButton({ currentUid, targetUid }: { currentUid?: string | null; targetUid: string }) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const disabled = !currentUid || currentUid === targetUid;

  useEffect(() => {
    if (!currentUid || !targetUid || currentUid === targetUid) return;
    const ref = doc(db, "users", currentUid, "following", targetUid);
    const unsub = onSnapshot(ref, (snap) => setIsFollowing(snap.exists()));
    return () => unsub();
  }, [currentUid, targetUid]);

  const toggleFollow = async () => {
    if (disabled) return;
    const fRef = doc(db, "users", currentUid!, "following", targetUid);
    const rRef = doc(db, "users", targetUid, "followers", currentUid!);
    if (isFollowing) {
      await Promise.all([deleteDoc(fRef), deleteDoc(rRef)]);
    } else {
      await Promise.all([
        setDoc(fRef, { createdAt: serverTimestamp() }),
        setDoc(rRef, { createdAt: serverTimestamp() }),
      ]);
    }
  };

  return (
    <Button onClick={toggleFollow} disabled={disabled} className="rounded-2xl">
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
