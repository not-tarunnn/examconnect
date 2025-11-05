import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { db, rtdb } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { ref, update } from "firebase/database";

export type FriendLite = {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string | null;
};

type Props = {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
  groupId: string;
  currentUid: string | null;
  existingMemberUids: string[];
};

export default function AddGroupMembersModal({ open, onOpenChangeAction, groupId, currentUid, existingMemberUids }: Props) {
  const [friends, setFriends] = useState<FriendLite[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load friends (followers ∪ following)
  useEffect(() => {
    if (!currentUid) return;

    const unsubFollow = onSnapshot(collection(db, "users", currentUid, "following"), async (snap) => {
      const ids = snap.docs.map((d) => d.id);
      const followings = await Promise.all(ids.map(async (uid) => await fetchUser(uid)));
      mergeFriends(followings);
    });

    const unsubFollowers = onSnapshot(collection(db, "users", currentUid, "followers"), async (snap) => {
      const ids = snap.docs.map((d) => d.id);
      const followers = await Promise.all(ids.map(async (uid) => await fetchUser(uid)));
      mergeFriends(followers);
    });

    return () => {
      unsubFollow();
      unsubFollowers();
    };
  }, [currentUid]);

  const fetchUser = async (uid: string): Promise<FriendLite> => {
    const snap = await getDoc(doc(db, "users", uid));
    const d: any = snap.data() || {};
    return {
      uid,
      username: d.username || uid,
      fullName: d.fullName || d.username || uid,
      profilePic: d.profilePic || d.profilePicture || null,
    };
  };

  const mergeFriends = (arr: FriendLite[]) => {
    setFriends((prev) => {
      const map = new Map<string, FriendLite>();
      [...prev, ...arr].forEach((u) => map.set(u.uid, u));
      return Array.from(map.values());
    });
  };

  const eligibleFriends = useMemo(() => {
    const setExisting = new Set(existingMemberUids);
    return friends
      .filter((f) => !setExisting.has(f.uid))
      .filter((f) =>
        f.fullName.toLowerCase().includes(query.toLowerCase()) ||
        f.username.toLowerCase().includes(query.toLowerCase())
      );
  }, [friends, existingMemberUids, query]);

  const toggle = (uid: string) => setSelected((s) => ({ ...s, [uid]: !s[uid] }));

  const canSubmit = useMemo(() => Object.values(selected).some(Boolean) && !!currentUid && !submitting, [selected, currentUid, submitting]);

  const addMembers = async () => {
    if (!currentUid) return;
    const toAdd = Object.entries(selected).filter(([, v]) => v).map(([uid]) => uid);
    if (toAdd.length === 0) return;
    setSubmitting(true);
    try {
      const now = Date.now();
      const updates: Record<string, any> = {};
      for (const uid of toAdd) {
        updates[`chats/${groupId}/members/${uid}`] = { role: "member", joinedAt: now, muted: false, pinned: false };
        updates[`groupMessages/${groupId}/participants/${uid}`] = true;
      }
      await update(ref(rtdb), updates);
      // reset
      setSelected({});
      setQuery("");
      onOpenChangeAction(false);
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) onOpenChangeAction(v); }}>
      <DialogContent className="max-w-xl bg-[#202020] text-white border border-white/10">
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
          <DialogDescription>Select friends to add to this group.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Search friends..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
            {eligibleFriends.length === 0 && (
              <div className="text-sm text-white/60 px-1">No eligible friends found.</div>
            )}
            {eligibleFriends.map((f) => (
              <label key={f.uid} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer">
                <Checkbox checked={!!selected[f.uid]} onCheckedChange={() => toggle(f.uid)} />
                {f.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.profilePic} alt={f.username} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{f.fullName}</p>
                  <p className="text-xs text-zinc-400 truncate">@{f.username}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChangeAction(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={addMembers} disabled={!canSubmit}>{submitting ? "Adding..." : "Add selected"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
