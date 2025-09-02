"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type MiniUser = { uid: string; username?: string; fullName?: string; profilePic?: string };

async function fetchMiniUser(uid: string): Promise<MiniUser> {
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data() as any;
  return {
    uid,
    username: data?.username,
    fullName: data?.fullName,
    profilePic: data?.profilePic,
  };
}

export default function FollowersFollowing({ targetUid, currentUid }: { targetUid: string; currentUid?: string | null }) {
  const [followersIds, setFollowersIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followers, setFollowers] = useState<MiniUser[]>([]);
  const [following, setFollowing] = useState<MiniUser[]>([]);
  const [myFollowingIds, setMyFollowingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!targetUid) return;
    const unsubFollowers = onSnapshot(collection(db, "users", targetUid, "followers"), (snap) => {
      setFollowersIds(snap.docs.map((d) => d.id));
    });
    const unsubFollowing = onSnapshot(collection(db, "users", targetUid, "following"), (snap) => {
      setFollowingIds(snap.docs.map((d) => d.id));
    });
    return () => {
      unsubFollowers();
      unsubFollowing();
    };
  }, [targetUid]);

  useEffect(() => {
    const load = async () => {
      const items = await Promise.all(followersIds.map(fetchMiniUser));
      setFollowers(items);
    };
    if (followersIds.length) load(); else setFollowers([]);
  }, [followersIds.join(",")]);

  useEffect(() => {
    const load = async () => {
      const items = await Promise.all(followingIds.map(fetchMiniUser));
      setFollowing(items);
    };
    if (followingIds.length) load(); else setFollowing([]);
  }, [followingIds.join(",")]);

  const countFollowers = followersIds.length;
  const countFollowing = followingIds.length;

  // Subscribe to current user's following list to label buttons correctly
  useEffect(() => {
    if (!currentUid) { setMyFollowingIds([]); return; }
    const unsub = onSnapshot(collection(db, "users", currentUid, "following"), (snap) => {
      setMyFollowingIds(snap.docs.map((d) => d.id));
    });
    return () => unsub();
  }, [currentUid]);

  const toggleFollow = useCallback(async (uid: string) => {
    if (!currentUid || currentUid === uid) return;
    const fRef = doc(db, "users", currentUid, "following", uid);
    const rRef = doc(db, "users", uid, "followers", currentUid);
    const isFollowing = followingIds.includes(uid) && targetUid === currentUid ? true : (await getDoc(fRef)).exists();
    if (isFollowing) {
      await Promise.all([deleteDoc(fRef), deleteDoc(rRef)]);
    } else {
      await Promise.all([
        setDoc(fRef, { createdAt: serverTimestamp() }),
        setDoc(rRef, { createdAt: serverTimestamp() }),
      ]);
    }
  }, [currentUid, followingIds, targetUid]);

  const removeFollower = useCallback(async (uid: string) => {
    if (!currentUid || currentUid !== targetUid) return; // only owner can remove
    const fRef = doc(db, "users", targetUid, "followers", uid);
    const rRef = doc(db, "users", uid, "following", targetUid);
    await Promise.all([deleteDoc(fRef), deleteDoc(rRef)]);
  }, [currentUid, targetUid]);

  const Entry = ({ u, primaryClass = "text-black", secondaryClass = "text-gray-800", showUnfollow, showRemove }: { u: MiniUser; primaryClass?: string; secondaryClass?: string; showUnfollow?: boolean; showRemove?: boolean }) => {
    const isFollowing = !!currentUid && myFollowingIds.includes(u.uid);
    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u.profilePic || "/avatar.png"} alt={u.username || u.uid} className="w-8 h-8 rounded-full object-cover" />
          <div>
            <div className={`text-sm font-medium ${primaryClass}`}>{u.fullName || u.username || u.uid}</div>
            <div className={`text-xs ${secondaryClass}`}>@{u.username || u.uid.slice(0, 6)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showUnfollow && currentUid && currentUid !== u.uid && (
            <Button size="sm" variant="outline" onClick={() => toggleFollow(u.uid)}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
          {showRemove && currentUid === targetUid && (
            <button
              aria-label="Remove follower"
              onClick={() => removeFollower(u.uid)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-black hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-2 flex items-center gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-sm text-black hover:underline">
            <span className="font-semibold text-black">{countFollowers}</span> Followers
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Followers</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-80 pr-3">
            {followers.length === 0 ? (
              <div className="text-sm text-gray-800">No followers yet.</div>
            ) : (
              followers.map((u) => (
                <Entry key={u.uid} u={u} primaryClass="text-black" secondaryClass="text-gray-800" showRemove={true} />
              ))
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <button className="text-sm text-black hover:underline">
            <span className="font-semibold text-black">{countFollowing}</span> Following
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Following</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-80 pr-3">
            {following.length === 0 ? (
              <div className="text-sm text-gray-800">Not following anyone yet.</div>
            ) : (
              following.map((u) => (
                <Entry key={u.uid} u={u} primaryClass="text-black" secondaryClass="text-gray-800" showUnfollow={true} />
              ))
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
