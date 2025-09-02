"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, onSnapshot, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ← adjust if your firebase client lives elsewhere
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, Edit2, Mail, User, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import FollowButton from "@/components/profile/FollowButton";
import FollowersFollowing from "@/components/profile/FollowersFollowing";

// --------------------
// Types
// --------------------

type UsernameDoc = {
  uid: string;
};

type UserProfile = {
  username?: string;
  fullName?: string;
  bio?: string;
  dob?: string | Timestamp; // "2006-08-04" or Firestore Timestamp
  gender?: string;
  targetExam?: string;
  classLevel?: string;
  profilePic?: string;
  createdAt?: Timestamp | string | Date;
  agreed?: boolean;
  verified?: boolean;
};

// --------------------
// Utils
// --------------------

function toDate(value: UserProfile["createdAt"], fallback: Date = new Date()): Date {
  if (!value) return fallback;
  // Firestore Timestamp
  if (typeof (value as any)?.toDate === "function") return (value as Timestamp).toDate();
  // ISO-ish string
  const parsed = new Date(value as string);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}

function formatJoined(createdAt?: UserProfile["createdAt"]): string {
  const d = toDate(createdAt);
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
}

function formatDOB(dob?: string | Timestamp): string | undefined {
  if (!dob) return undefined;
  if (typeof (dob as any)?.toDate === "function") {
    const d = (dob as Timestamp).toDate();
    return d.toISOString().slice(0, 10);
  }
  // expect YYYY-MM-DD string
  if (typeof dob === "string") return dob;
  return undefined;
}

// --------------------
// Skeletons
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

// --------------------
// Main Page
// --------------------

export default function UsernameProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = decodeURIComponent(String(params?.username || "")).toLowerCase();

  const { user: authUser } = useAuth();
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 1) Resolve slug → uid (usernames/{slug})
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);

    const ref = doc(db, "usernames", username);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        setUid(null);
        setNotFound(true);
        setProfile(null);
        setLoading(false);
        return;
      }
      const data = snap.data() as UsernameDoc;
      setUid(data.uid);
      setNotFound(false);
    });

    return () => unsub();
  }, [username]);

  // 2) Subscribe to user doc (users/{uid})
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
    });
    return () => unsub();
  }, [uid]);

  const joined = useMemo(() => formatJoined(profile?.createdAt), [profile?.createdAt]);
  const dob = useMemo(() => formatDOB(profile?.dob), [profile?.dob]);

  if (loading) return <HeaderSkeleton />;

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <Card className="max-w-lg w-full border-dashed">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <User className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-semibold">Profile not found</h1>
            <p className="text-sm text-muted-foreground mt-1">We couldn’t find any user for <span className="font-mono">@{username}</span>.</p>
            <div className="mt-6">
              <Button onClick={() => router.push("/dashboard")}>Go home</Button>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-40 w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700"
        />

        {/* Header Row */}
        <div className="max-w-5xl mx-auto px-4 -mt-6" >
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-background bg-zinc-900 flex items-center justify-center">
              {profile.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={profile.fullName || profile.username || "avatar"}
                  src={profile.profilePic}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold select-none">
                  {(profile.fullName || profile.username || username || "?")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
              )}
            </div>

            {/* Name + Handle with Followers/Following on the right */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight truncate">
                      {profile.fullName || profile.username || username}
                    </h1>
                    {profile.verified ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">@{profile.username || username}</p>
                </div>
                {uid ? <FollowersFollowing targetUid={uid} currentUid={authUser?.uid} /> : null}
              </div>
            </div>

            {/* Actions */}
            <div className="hidden sm:flex gap-2 pb-1">
              <Button variant="outline" className="rounded-2xl" onClick={() => router.push(`/message?uid=${uid}`)}>
                <Mail className="h-4 w-4 mr-2" /> Message
              </Button>
              {uid ? (
                <FollowButton currentUid={authUser?.uid ?? null} targetUid={uid} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <section className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* Bio */}
              <h2 className="text-base font-semibold">About</h2>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                {profile.bio?.trim() ? profile.bio : "No bio yet."}
              </p>

              <Separator className="my-6" />

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow icon={<Calendar className="h-4 w-4" />} label="Joined" value={joined} />
                <DetailRow icon={<User className="h-4 w-4" />} label="Gender" value={profile.gender || "—"} />
                <DetailRow icon={<MapPin className="h-4 w-4" />} label="Target Exam" value={profile.targetExam || "—"} />
                <DetailRow icon={<User className="h-4 w-4" />} label="Class Level" value={profile.classLevel || "—"} />
              </div>
            </CardContent>
          </Card>

          {/* Future Tabs / content */}
          <div className="mt-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-base font-semibold">Activity</h2>
                <p className="text-sm text-muted-foreground mt-2">Posts, tasks, and streaks will appear here once connected.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Right column */}
        <aside className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold">Quick Actions</h3>
              <div className="mt-4 flex flex-col gap-2">
                <Link href={`/profile/${username}/edit`} className="w-full">
      <Button variant="outline" className="w-full rounded-2xl">
        <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
      </Button>
    </Link>
                <Button className="w-full rounded-2xl">
                  <Sparkles className="h-4 w-4 mr-2" /> Share Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold">Meta</h3>
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <div className="flex items-center justify-between">
                  <span>Username</span>
                  <code className="text-foreground">@{username}</code>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Mobile Actions */}
      <div className="sm:hidden sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t mt-8">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2">
          <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => router.push(`/message?uid=${uid}`)}>
            <Mail className="h-4 w-4 mr-2" /> Message
          </Button>
          {uid ? (
            <div className="flex-1">
              <FollowButton currentUid={authUser?.uid ?? null} targetUid={uid} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// --------------------
// Detail Row helper
// --------------------

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm mt-0.5">{value || "—"}</div>
      </div>
    </div>
  );
}
