"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { rtdb } from "@/lib/firebase";
import { ref, set, update, get } from "firebase/database";

export type LiteUser = {
  uid: string;
  username: string;
  fullName: string;
  profilePic?: string;
};

type Props = {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
  friends: LiteUser[];
  currentUid: string | null;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export default function CreateGroupModal({ open, onOpenChangeAction, friends, currentUid }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const count = Object.values(selected).filter(Boolean).length;
    return !!name.trim() && !!currentUid && count > 0 && !submitting;
  }, [name, currentUid, selected, submitting]);

  const onToggle = (uid: string) => {
    setSelected((s) => ({ ...s, [uid]: !s[uid] }));
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(",");
        const base64 = comma >= 0 ? result.slice(comma + 1) : result;
        setImageBase64(base64);
        setImageMime(f.type || "image/jpeg");
      };
      reader.readAsDataURL(f);
    } else {
      setImageBase64(null);
      setImageMime(null);
    }
  };

  const reset = () => {
    setName("");
    setDescription("");
    setSelected({});
    setImageFile(null);
    setImageBase64(null);
    setImageMime(null);
    setSubmitting(false);
    setError(null);
  };

  const createGroup = async () => {
    if (!currentUid) return;
    setSubmitting(true);
    setError(null);

    try {
      const baseId = `${currentUid}_${name.trim().replace(/[^A-Za-z0-9]+/g, "")}`.slice(0, 80) || `${currentUid}_group`;
      let groupId = baseId;
      let suffix = 0;
      while (true) {
        const existsSnap = await get(ref(rtdb, `chats/${groupId}`));
        if (!existsSnap.exists()) break;
        suffix += 1;
        groupId = `${baseId}_${suffix}`;
      }

      const iconBase64 = imageBase64 || null;
      const iconMime = imageMime || null;

      const now = Date.now();
      const selectedMembers = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([uid]) => uid);

      const members: Record<string, any> = {};
      for (const uid of new Set([currentUid, ...selectedMembers])) {
        members[uid] = {
          role: uid === currentUid ? "admin" : "member",
          joinedAt: now,
          muted: false,
          pinned: uid === currentUid ? true : false,
        };
      }

      const admins: Record<string, boolean> = { [currentUid]: true };

      const payload = {
        type: "group",
        groupId,
        name: name.trim(),
        description: description.trim(),
        iconBase64,
        iconMime,
        createdBy: currentUid,
        createdAt: now,
        inviteLink: `examconnect://join/${groupId}`,
        lastMessage: "",
        lastMessageSender: "",
        lastMessageTimestamp: now,
        members,
        admins,
        groupSettings: {
          allowMessageDelete: true,
          allowMemberAdd: true,
          allowMemberLeave: true,
          allowMediaShare: true,
          maxMembers: 200,
        },
      };

      await set(ref(rtdb, `chats/${groupId}`), payload);

      const updates: Record<string, any> = {};
      for (const uid of Object.keys(members)) {
        updates[`groupMessages/${groupId}/participants/${uid}`] = true;
      }
      updates[`groupMessages/${groupId}/lastMessageAt`] = now;
      await update(ref(rtdb), updates);

      reset();
      onOpenChangeAction(false);
    } catch (e: any) {
      console.error("Create group failed:", e);
      setError(e?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) onOpenChangeAction(v); }}>
      <DialogContent className="max-w-2xl bg-[#202020] text-white border border-white/10">
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
          <DialogDescription>Choose a name, optional description and image, then select members.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gname">Group name</Label>
              <Input id="gname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Study Circle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gdesc">Description</Label>
              <Textarea id="gdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A group for discussing exam prep and sharing notes." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gicon">Group image</Label>
              <Input id="gicon" type="file" accept="image/*" onChange={onPick} />
            </div>
          </div>

          <div className="md:col-span-1">
            <p className="text-sm font-medium mb-2">Members</p>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
              {friends.map((f) => (
                <label key={f.uid} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer">
                  <Checkbox checked={!!selected[f.uid]} onCheckedChange={() => onToggle(f.uid)} />
                  {f.profilePic ? (
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
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChangeAction(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={createGroup} disabled={!canSubmit}>{submitting ? "Creating..." : "Create group"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
