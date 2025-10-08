"use client";

import React, { useEffect, useState } from "react";
import { auth, db, rtdb } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { onDisconnect, onValue, push as rPush, ref, remove as rRemove, serverTimestamp, update as rUpdate } from "firebase/database";

interface UserLite {
  uid: string;
  username?: string;
  profilePic?: string;
}

interface PendingInvite {
  inviteId: string;
  fromUid: string;
  roomId: string;
  fromName?: string;
  fromPic?: string;
}

interface InviteFriendsSectionProps {
  roomId: string | null;
  onRoomIdChange: (id: string | null) => void;
}

const InviteFriendsSection: React.FC<InviteFriendsSectionProps> = ({ roomId, onRoomIdChange }) => {
  const [participants, setParticipants] = useState<UserLite[]>([]);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [friends, setFriends] = useState<UserLite[]>([]);

  // Load friends (followers ∪ following)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubFollow = onSnapshot(collection(db, "users", user.uid, "following"), async (snap) => {
      const ids = snap.docs.map((d) => d.id);
      const followings = await Promise.all(ids.map(async (uid) => await fetchUser(uid)));
      mergeFriends(followings);
    });

    const unsubFollowers = onSnapshot(collection(db, "users", user.uid, "followers"), async (snap) => {
      const ids = snap.docs.map((d) => d.id);
      const followers = await Promise.all(ids.map(async (uid) => await fetchUser(uid)));
      mergeFriends(followers);
    });

    return () => {
      unsubFollow();
      unsubFollowers();
    };
  }, []);

  const fetchUser = async (uid: string): Promise<UserLite> => {
    const s = await import("firebase/firestore");
    const snap = await s.getDoc(s.doc(db, "users", uid));
    const data = snap.data() as any;
    const pic = data?.profilePic || data?.profilePicture || data?.photoURL || null;
    const name = data?.username || data?.fullName || uid;
    return { uid, username: name, profilePic: pic };
  };

  const mergeFriends = (arr: UserLite[]) => {
    setFriends((prev) => {
      const map = new Map<string, UserLite>();
      [...prev, ...arr].forEach((u) => map.set(u.uid, u));
      return Array.from(map.values());
    });
  };

  // Incoming invites (RTDB)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const invRef = ref(rtdb, `pomodoroInvites/${user.uid}`);
    const off = onValue(invRef, (snap) => {
      let found: PendingInvite | null = null;
      snap.forEach((child) => {
        const val = child.val();
        if (val && val.status === "pending") {
          found = {
            inviteId: child.key as string,
            fromUid: val.fromUid,
            roomId: val.roomId,
            fromName: val.fromName,
            fromPic: val.fromPic,
          };
          return true;
        }
        return undefined;
      });
      setPendingInvite(found);
    });
    return () => off();
  }, []);

  // Participants subscription for current room and ensure self joined
  useEffect(() => {
    const joinSelf = async (rid: string) => {
      const user = auth.currentUser;
      if (!user) return;
      const profile = await fetchUser(user.uid);
      const partRef = ref(rtdb, `pomodoroRooms/${rid}/participants/${user.uid}`);
      await rUpdate(partRef, {
        username: profile.username || user.uid,
        profilePic: profile.profilePic || null,
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
      onDisconnect(partRef).remove();
    };

    if (!roomId) return;
    // ensure presence
    joinSelf(roomId);

    const partsRef = ref(rtdb, `pomodoroRooms/${roomId}/participants`);
    const offParts = onValue(partsRef, (snap) => {
      const list: UserLite[] = [];
      snap.forEach((child) => {
        const val = child.val();
        list.push({ uid: child.key as string, username: val?.username, profilePic: val?.profilePic });
      });
      setParticipants(list);
    });

    // heartbeat
    const user = auth.currentUser;
    let hb: any;
    if (user) {
      const myRef = ref(rtdb, `pomodoroRooms/${roomId}/participants/${user.uid}`);
      hb = setInterval(() => {
        rUpdate(myRef, { lastSeen: serverTimestamp() });
      }, 30000);
    }

    return () => {
      offParts();
      if (hb) clearInterval(hb);
    };
  }, [roomId]);

  const ensureRoom = async (): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    if (roomId) return roomId;
    const roomRef = rPush(ref(rtdb, "pomodoroRooms"));
    const newId = roomRef.key as string;
    await rUpdate(ref(rtdb, `pomodoroRooms/${newId}`), {
      host: user.uid,
      createdAt: serverTimestamp(),
      state: {
        mode: "paused",
        durationSec: 25 * 60,
        epochStartMs: null,
        accumulatedMs: 0,
        updatedAt: serverTimestamp(),
      },
    });
    onRoomIdChange(newId);
    // join self
    const profile = await fetchUser(user.uid);
    const partRef = ref(rtdb, `pomodoroRooms/${newId}/participants/${user.uid}`);
    await rUpdate(partRef, {
      username: profile.username || user.uid,
      profilePic: profile.profilePic || null,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    });
    onDisconnect(partRef).remove();
    return newId;
  };

  const inviteFriend = async (targetUid: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const rid = await ensureRoom();
    const profile = await fetchUser(user.uid);
    const invRef = rPush(ref(rtdb, `pomodoroInvites/${targetUid}`));
    await rUpdate(invRef, {
      roomId: rid,
      fromUid: user.uid,
      fromName: profile.username || user.uid,
      fromPic: profile.profilePic || null,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  };

  const acceptInvite = async (inv: { inviteId: string; roomId: string }) => {
    const user = auth.currentUser;
    if (!user) return;
    // join room
    const profile = await fetchUser(user.uid);
    const partRef = ref(rtdb, `pomodoroRooms/${inv.roomId}/participants/${user.uid}`);
    await rUpdate(partRef, {
      username: profile.username || user.uid,
      profilePic: profile.profilePic || null,
      joinedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    });
    onDisconnect(partRef).remove();
    onRoomIdChange(inv.roomId);
    await rUpdate(ref(rtdb, `pomodoroInvites/${user.uid}/${inv.inviteId}`), {
      status: "accepted",
      respondedAt: serverTimestamp(),
    });
    setPendingInvite(null);
  };

  const denyInvite = async (inv: { inviteId: string }) => {
    const user = auth.currentUser;
    if (!user) return;
    await rUpdate(ref(rtdb, `pomodoroInvites/${user.uid}/${inv.inviteId}`), {
      status: "denied",
      respondedAt: serverTimestamp(),
    });
    setPendingInvite(null);
  };

  return (
    <div className="text-white w-full">
      {/* Participants avatars */}
      {participants.length > 0 && (
        <div className="mb-2 flex -space-x-3">
          {participants.slice(0, 6).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.uid}
              src={p.profilePic || "/api/placeholder/32/32"}
              alt={p.username || p.uid}
              className="w-8 h-8 rounded-full ring-2 ring-black object-cover"
            />
          ))}
          {participants.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-white/10 ring-2 ring-black grid place-items-center text-xs">
              +{participants.length - 6}
            </div>
          )}
        </div>
      )}

      {/* Friend selector */}
      <div className="mb-2">
        <details className="bg-white/5 rounded-lg border border-white/10">
          <summary className="px-3 py-2 cursor-pointer text-sm">Invite a friend</summary>
          <div className="max-h-40 overflow-auto p-2 space-y-1">
            {friends.length === 0 && <div className="text-xs text-white/60">No friends yet.</div>}
            {friends.map((f) => (
              <button
                key={f.uid}
                onClick={() => inviteFriend(f.uid)}
                className="w-full text-left px-2 py-1 rounded hover:bg-white/10 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.profilePic || "/api/placeholder/20/20"}
                    alt={f.username || f.uid}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  {f.username || f.uid.slice(0, 6)}
                </span>
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* Pending invite prompt */}
      {pendingInvite && (
        <div className="mb-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2">
          <div className="truncate">
            Invite from {pendingInvite.fromName || pendingInvite.fromUid.slice(0, 6)}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => acceptInvite(pendingInvite)}
              className="px-2 py-1 rounded bg-green-500 text-black"
            >
              Yes
            </button>
            <button
              onClick={() => denyInvite(pendingInvite)}
              className="px-2 py-1 rounded bg-red-500 text-black"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteFriendsSection;
