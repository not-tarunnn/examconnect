"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, onSnapshot, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { blobToBase64 } from "@/lib/cropImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Calendar, CheckCircle2, Loader2, ArrowLeft, Pencil } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

// --------------------
// Types
// --------------------

type UserProfile = {
  username?: string;
  fullName?: string;
  bio?: string;
  dob?: string | Timestamp;
  gender?: string;
  targetExam?: string;
  classLevel?: string;
  profilePic?: string;
  createdAt?: Timestamp | string | Date;
  agreed?: boolean;
};

// --------------------
// Helpers
// --------------------

function toDate(value?: any, fallback: Date = new Date()): Date {
  if (!value) return fallback;
  if (typeof value?.toDate === "function") return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? fallback : d;
}

function formatDOB(dob?: string | Timestamp): string | undefined {
  if (!dob) return undefined;
  if (typeof (dob as any)?.toDate === "function") {
    const d = (dob as Timestamp).toDate();
    return d.toISOString().slice(0, 10);
  }
  if (typeof dob === "string") return dob;
  return undefined;
}

// image utilities for cropping
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });

async function getCroppedBlob(imageSrc: string, crop: Area, mime = "image/jpeg"): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  // Area provides pixel values relative to the image
  const { x, y, width, height } = crop;

  canvas.width = Math.round(width);
  canvas.height = Math.round(height);

  ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Canvas empty"))), mime, 0.92);
  });
}

// --------------------
// Main Page
// --------------------

export default function EditProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const slug = decodeURIComponent(String(params?.username || "")).toLowerCase();

  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [authedUid, setAuthedUid] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state (username removed on purpose — not editable)
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    gender: "",
    targetExam: "",
    classLevel: "",
    dob: "",
    profilePic: "",
  });

  // Avatar cropper state
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve slug → uid (usernames collection is still used for lookup)
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const ref = doc(db, "usernames", slug);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setUid(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setUid((snap.data() as { uid: string }).uid);
      setNotFound(false);
    });
    return () => unsub();
  }, [slug]);

  // Subscribe to user doc and populate form (username read-only)
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      setLoading(false);
      if (!snap.exists()) {
        setProfile(null);
        setNotFound(true);
        return;
      }
      const data = snap.data() as UserProfile;
      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        bio: data.bio || "",
        gender: data.gender || "",
        targetExam: data.targetExam || "",
        classLevel: data.classLevel || "",
        dob: formatDOB(data.dob) || "",
        profilePic: data.profilePic || "",
      });
    });
    return () => unsub();
  }, [uid]);

  // Track auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthedUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  const joined = useMemo(() => {
    const d = toDate(profile?.createdAt);
    try {
      return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long" }).format(d);
    } catch {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
  }, [profile?.createdAt]);

  // ---- Avatar: open file, crop, upload ----
  const onSelectAvatarFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropOpen(true);
  };

  const closeCropper = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setLocalFile(null);
    setCroppedAreaPixels(null);
    setCropOpen(false);
  };

  const onCropComplete = (_: Area, pixels: Area) => setCroppedAreaPixels(pixels);

const confirmCropAndUpload = async () => {
  if (!uid || !imageSrc || !croppedAreaPixels) return;
  setUploadingAvatar(true);
  try {
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, localFile?.type || "image/jpeg");

    // Convert blob to base64
    const base64Image = await blobToBase64(blob);

    // Save base64 directly to Firestore
    await updateDoc(doc(db, "users", uid), {
      profilePic: base64Image,
      updatedAt: serverTimestamp(),
    });

    // update local state so preview works too
    setForm((f) => ({ ...f, profilePic: base64Image }));
    setMessage("Profile photo updated.");
    closeCropper();
  } catch (e) {
    console.error(e);
    setMessage("Failed to upload avatar.");
  } finally {
    setUploadingAvatar(false);
  }
};


  // ---- Save: simple update only to users/{uid} (no username changes) ----
  async function onSave() {
    if (!uid || !profile) return;
    if (authedUid !== uid) {
      setMessage("You can only edit your own profile.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        gender: form.gender || "",
        targetExam: form.targetExam || "",
        classLevel: form.classLevel || "",
        dob: form.dob || "",
        profilePic: form.profilePic || profile.profilePic || "",
        updatedAt: serverTimestamp(),
      });

      setMessage("Profile saved");
      // redirect to profile (username is read-only; fallback to slug)
      router.push(`/profile/${profile?.username || slug}`);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setMessage(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <HeaderSkeleton />;
  if (notFound)
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <Card className="max-w-lg w-full border-dashed">
          <CardContent className="py-10 text-center">
            <h1 className="text-xl font-semibold">User not found</h1>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn’t find any user for <span className="font-mono">@{slug}</span>.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push("/")}>Go home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  if (authedUid && uid && authedUid !== uid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <Card className="max-w-lg w-full">
          <CardContent className="py-10 text-center">
            <h1 className="text-xl font-semibold">You can’t edit this profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Only the owner can edit their profile.</p>
            <div className="mt-6 flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push(`/profile/${slug}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> View profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cover */}
      <div className="relative">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="h-40 w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />
        <div className="max-w-5xl mx-auto px-4 -mt-6">
          <div className="flex items-end gap-4">
            {/* Avatar with hover edit overlay */}
            <div className="group relative h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-background bg-zinc-900">
              {form.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={form.fullName || profile?.username || slug} src={form.profilePic} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-3xl font-semibold select-none">{(form.fullName || profile?.username || slug || "?").slice(0, 1).toUpperCase()}</span>
                </div>
              )}

              {/* Hover overlay */}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" title="Change photo">
                <Pencil className="h-6 w-6 text-black" />
              </button>

              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onSelectAvatarFile} />
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight truncate">Edit Profile</h1>
                {profile?.agreed ? <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-4 w-4" /> Verified</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground truncate">@{profile?.username || slug}</p>
            </div>

            <div className="hidden sm:flex gap-2 pb-1">
              <Button variant="outline" onClick={() => router.push(`/profile/${slug}`)}>Cancel</Button>
              <Button onClick={onSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Form */}
        <section className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Your name" />
              </div>

              {/* Bio */}
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell the world about you…" />
                <div className="text-xs text-muted-foreground text-right">{form.bio.length}/280</div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className="h-10 rounded-md border bg-transparent px-3 text-sm" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                    <option value="">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
                </div>

                <div className="grid gap-2">
<div className="grid gap-2">
  <Label htmlFor="targetExam">Target Exam</Label>
  <select
    id="targetExam"
    className="h-10 rounded-md border bg-transparent px-3 text-sm"
    value={
      ["NEET", "JEE", "UPSC-CSE", "CUET"].includes(form.targetExam)
        ? form.targetExam
        : "Others"
    }
    onChange={(e) => {
      const value = e.target.value
      setForm((f) => ({
        ...f,
        targetExam: value === "Others" ? "" : value, // reset if "Others"
      }))
    }}
  >
    <option value="">Select exam</option>
    <option value="NEET">NEET</option>
    <option value="JEE">JEE</option>
    <option value="UPSC-CSE">UPSC-CSE</option>
    <option value="CUET">CUET</option>
    <option value="Others">Others</option>
  </select>

  {/* If "Others" is selected, show text input */}
  {(!["NEET", "JEE", "UPSC-CSE", "CUET"].includes(form.targetExam)) && (
    <input
      type="text"
      placeholder="Enter your exam"
      className="h-10 rounded-md border bg-transparent px-3 text-sm"
      value={form.targetExam}
      onChange={(e) =>
        setForm((f) => ({ ...f, targetExam: e.target.value }))
      }
    />
  )}
</div>
</div>

               <div className="grid gap-2">
  <Label htmlFor="classLevel">Class Level</Label>
  <select
    id="classLevel"
    value={form.classLevel}
    onChange={(e) =>
      setForm((f) => ({ ...f, classLevel: e.target.value }))
    }
    className="h-10 border rounded-lg p-2"
  >
    <option value="">Select your class level</option>
    <option value="Class 11">Class 11</option>
    <option value="Class 12">Class 12</option>
    <option value="Undergraduate">Undergraduate</option>
    <option value="Graduate">Graduate</option>
    <option value="Post-Graduate">Post-Graduate</option>
  </select>
</div>

              </div>

              {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}

              <div className="sm:hidden">
                <Button className="w-full" onClick={onSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Live Preview */}
        <aside className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold mb-4">Preview</h3>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {form.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.profilePic} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold select-none">{(form.fullName || profile?.username || slug || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{form.fullName || profile?.username || slug}</div>
                  <div className="text-sm text-muted-foreground truncate">@{profile?.username || slug}</div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Joined {joined}
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.bio || "No bio yet."}</p>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Cropper Modal */}
      <Dialog open={cropOpen} onOpenChange={(open) => (open ? setCropOpen(true) : closeCropper())}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit profile photo</DialogTitle>
          </DialogHeader>

          <div className="relative aspect-square bg-black rounded-md overflow-hidden">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={(c) => setCrop(c as { x: number; y: number })}
                onZoomChange={(z) => setZoom(z)}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>

          <div className="pt-4 space-y-2">
            <Label>Zoom</Label>
            <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(v: number[]) => setZoom(v[0])} />
          </div>

          <DialogFooter className=" text-black gap-2">
            <Button variant="outline" onClick={closeCropper}>Cancel</Button>
            <Button onClick={confirmCropAndUpload} disabled={uploadingAvatar}>
              {uploadingAvatar ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --------------------
// Skeleton
// --------------------
function HeaderSkeleton() {
  return (
    <div className="relative">
      <div className="h-40 w-full bg-gradient-to-br from-black via-zinc-800 to-zinc-700" />
      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="flex items-end gap-4">
          <Skeleton className="h-24 w-24 rounded-2xl ring-4 ring-background" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="hidden sm:flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
