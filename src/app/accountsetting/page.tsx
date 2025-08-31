"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  LogOut,
  Trash2,
  Link as LinkIcon,
  Database,
  CreditCard,
  Download,
  Users,
  Eye,
} from "lucide-react";

// shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Auth hook (as per your project)
import useAuth from "@/hooks/useAuth";

// Optional: Firebase helpers if you want real wiring now
// Uncomment and wire if your project exposes these
// import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail, deleteUser, linkWithPopup, unlink, GoogleAuthProvider } from "firebase/auth";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// Types
type Theme = "light" | "dark" | "system";

type Preferences = {
  push: boolean;
  email: boolean;
  theme: Theme;
  language: string;
};

type Privacy = {
  whoCanMessage: "everyone" | "friends" | "noone";
  onlineStatus: "everyone" | "friends" | "noone";
  analytics: boolean;
  personalized: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function AccountSettingsPage() {
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Local state (you can hydrate from Firestore if desired)
  const [prefs, setPrefs] = useState<Preferences>({
    push: true,
    email: true,
    theme: "system",
    language: "en",
  });

  const [privacy, setPrivacy] = useState<Privacy>({
    whoCanMessage: "everyone",
    onlineStatus: "friends",
    analytics: true,
    personalized: true,
  });

  const [notifCategories, setNotifCategories] = useState({
    reminders: true,
    chat: true,
    streaks: true,
    announcements: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirm: "",
  });

  const canChangePassword = useMemo(() => {
    // allow password change only if user has password provider
    const providers = (user?.providerData || []).map((p: any) => p.providerId);
    return providers.includes("password");
  }, [user]);

  // Load settings from Firestore example (optional)
  useEffect(() => {
    // (Optional) Hydrate from Firestore
    // async function load() {
    //   if (!user) return;
    //   const ref = doc(db, "users", user.uid);
    //   const snap = await getDoc(ref);
    //   const data = snap.data();
    //   if (data?.settings?.preferences) setPrefs(data.settings.preferences);
    //   if (data?.settings?.privacy) setPrivacy(data.settings.privacy);
    //   if (data?.settings?.notifications) setNotifCategories(data.settings.notifications);
    // }
    // load();
  }, [user]);

  async function saveAll() {
    setSaving(true);
    try {
      // (Optional) Persist to Firestore
      // if (user) {
      //   const ref = doc(db, "users", user.uid);
      //   await updateDoc(ref, {
      //     settings: {
      //       preferences: prefs,
      //       privacy,
      //       notifications: notifCategories,
      //     },
      //     updatedAt: new Date(),
      //   });
      // }
      await new Promise((r) => setTimeout(r, 600)); // UX delay mock
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function resetLocal() {
    // simple local reset – customize if you hydrate from DB
    setPrefs({ push: true, email: true, theme: "system", language: "en" });
    setPrivacy({ whoCanMessage: "everyone", onlineStatus: "friends", analytics: true, personalized: true });
    setNotifCategories({ reminders: true, chat: true, streaks: true, announcements: false });
    setPasswordForm({ newPassword: "", confirm: "" });
  }

  async function handleLogout() {
    try {
      // TODO: Implement sign out logic here, e.g. call your auth provider's signOut method
      alert("Sign out logic not implemented.");
    } catch (e) {
      console.error(e);
    }
  }

  // Placeholder delete/deactivate flows. Wire to Firestore/Auth as needed.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Account Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={resetLocal} disabled={saving}>Discard</Button>
            <Button onClick={saveAll} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Security & Login */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <div>
                    <CardTitle>Security & Login</CardTitle>
                    <CardDescription>Protect your account and manage access.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Linked Accounts (read-only demo) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Linked Accounts</p>
                      <p className="text-sm text-muted-foreground">Manage sign-in providers (Google, Apple, Email).</p>
                    </div>
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(user?.providerData || []).map((p: any) => (
                      <span key={p.providerId} className="text-xs rounded-full border px-3 py-1">
                        {p.providerId}
                      </span>
                    ))}
                    {!user?.providerData?.length && (
                      <span className="text-xs text-muted-foreground">No providers linked</span>
                    )}
                  </div>
                </section>

                <Separator />

                {/* Change password */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">
                        {canChangePassword
                          ? "Use a strong, unique password."
                          : "Password is managed by your provider (e.g., Google)."}
                      </p>
                    </div>
                    <Eye className="h-4 w-4" />
                  </div>

                  {canChangePassword ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="newPass">New password</Label>
                        <Input
                          id="newPass"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((s) => ({ ...s, newPassword: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm password</Label>
                        <Input
                          id="confirm"
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm((s) => ({ ...s, confirm: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <Button
                          variant="default"
                          onClick={() => {
                            if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirm) {
                              alert("Passwords do not match.");
                              return;
                            }
                            // TODO: call Firebase updatePassword with re-auth if required
                            alert("Password change flow goes here.");
                          }}
                        >
                          Update password
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            // TODO: sendPasswordResetEmail(user.email)
                            alert("Password reset email flow goes here.");
                          }}
                        >
                          Send reset email
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border p-3 text-sm text-muted-foreground">
                      To change your password, manage it through your linked provider’s security page.
                    </div>
                  )}
                </section>

                <Separator />

                {/* Login activity (lightweight) */}
                <section className="space-y-1">
                  <p className="font-medium">Login Activity</p>
                  <p className="text-sm text-muted-foreground">Last sign-in: {user?.metadata?.lastSignInTime || "—"}</p>
                </section>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Notifications, theme, and language.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ToggleRow
                    label="Push notifications"
                    description="Get device alerts for reminders and chats"
                    checked={prefs.push}
                    onCheckedChange={(v) => setPrefs((s) => ({ ...s, push: v }))}
                  />
                  <ToggleRow
                    label="Email notifications"
                    description="Get emails for updates and summaries"
                    checked={prefs.email}
                    onCheckedChange={(v) => setPrefs((s) => ({ ...s, email: v }))}
                  />
                </div>

                {/* Categories */}
                <div className="rounded-2xl border p-4">
                  <p className="font-medium mb-3">Notification categories</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ToggleRow
                      label="Study reminders"
                      checked={notifCategories.reminders}
                      onCheckedChange={(v) => setNotifCategories((s) => ({ ...s, reminders: v }))}
                    />
                    <ToggleRow
                      label="Chat messages"
                      checked={notifCategories.chat}
                      onCheckedChange={(v) => setNotifCategories((s) => ({ ...s, chat: v }))}
                    />
                    <ToggleRow
                      label="Streak updates"
                      checked={notifCategories.streaks}
                      onCheckedChange={(v) => setNotifCategories((s) => ({ ...s, streaks: v }))}
                    />
                    <ToggleRow
                      label="Announcements"
                      checked={notifCategories.announcements}
                      onCheckedChange={(v) => setNotifCategories((s) => ({ ...s, announcements: v }))}
                    />
                  </div>
                </div>

                {/* Theme & language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["light", "dark", "system"] as Theme[]).map((t) => (
                        <Button
                          key={t}
                          variant={prefs.theme === t ? "default" : "outline"}
                          onClick={() => setPrefs((s) => ({ ...s, theme: t }))}
                          className="capitalize"
                        >
                          {t === "light" ? <Sun className="h-4 w-4 mr-0" /> : t === "dark" ? <Moon className="h-4 w-4 mr-0" /> : <Globe className="h-4 w-4 -mr-2" />} {t}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={prefs.language}
                      onValueChange={(v) => setPrefs((s) => ({ ...s, language: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Safety */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <CardTitle>Privacy & Safety</CardTitle>
                    <CardDescription>Control visibility and data usage.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectRow
                    label="Who can message me"
                    value={privacy.whoCanMessage}
                    onChange={(v) => setPrivacy((s) => ({ ...s, whoCanMessage: v as Privacy["whoCanMessage"] }))}
                    options={[
                      { value: "everyone", label: "Everyone" },
                      { value: "friends", label: "Friends only" },
                      { value: "noone", label: "No one" },
                    ]}
                  />
                  <SelectRow
                    label="Show online status to"
                    value={privacy.onlineStatus}
                    onChange={(v) => setPrivacy((s) => ({ ...s, onlineStatus: v as Privacy["onlineStatus"] }))}
                    options={[
                      { value: "everyone", label: "Everyone" },
                      { value: "friends", label: "Friends only" },
                      { value: "noone", label: "No one" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ToggleRow
                    label="Allow analytics"
                    description="Help us improve by sharing anonymous usage data"
                    checked={privacy.analytics}
                    onCheckedChange={(v) => setPrivacy((s) => ({ ...s, analytics: v }))}
                  />
                  <ToggleRow
                    label="Personalized recommendations"
                    description="Use your activity to tailor tips"
                    checked={privacy.personalized}
                    onCheckedChange={(v) => setPrivacy((s) => ({ ...s, personalized: v }))}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Manage blocked users</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Blocked users</DialogTitle>
                        <DialogDescription>
                          Unblock users to allow messages and profile visibility.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="text-sm text-muted-foreground">(Connect this to your Firestore list of blocked userIds.)</div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data & Storage */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5" />
                  <div>
                    <CardTitle>Data & Storage</CardTitle>
                    <CardDescription>Export, clear, and manage your data.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-medium">Download my data</p>
                    <p className="text-sm text-muted-foreground">Get a copy of your profile, tasks, habits, and activity.</p>
                  </div>
                  <Button variant="outline" onClick={() => alert("Export flow goes here (server/API).")}> <Download className="h-4 w-4 mr-2"/> Export</Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-medium">Clear local cache</p>
                    <p className="text-sm text-muted-foreground">Frees space and fixes minor issues. You’ll stay signed in.</p>
                  </div>
                  <Button variant="secondary" onClick={() => {
                    try {
                      if (typeof window !== "undefined") {
                        localStorage.clear();
                        sessionStorage.clear();
                        alert("Local cache cleared.");
                      }
                    } catch {}
                  }}>Clear</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription / Billing */}
          <motion.div variants={fadeUp}>
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your Exam Connect plan.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current plan</p>
                    <p className="text-sm text-muted-foreground">Free (upgrade coming soon)</p>
                  </div>
                  <Button disabled>Manage</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Management */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <div>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Deactivate, delete, or sign out.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Deactivate */}
                  <div className="rounded-2xl border p-4 flex flex-col gap-3">
                    <div>
                      <p className="font-medium">Deactivate account</p>
                      <p className="text-sm text-muted-foreground">Hide your profile & pause activity. You can reactivate anytime.</p>
                    </div>
                    <AlertDialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Deactivate</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            We’ll mark your account inactive. Your data stays intact and you can return anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => alert("Deactivate flow (Firestore flag) goes here.")}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Delete */}
                  <div className="rounded-2xl border p-4 flex flex-col gap-3">
                    <div>
                      <p className="font-medium">Delete account</p>
                      <p className="text-sm text-muted-foreground">Permanent and irreversible. All data will be removed.</p>
                    </div>
                    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2"/>Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => alert("Delete flow (Firebase deleteUser + purge) goes here.")}>Yes, delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Logout */}
                  <div className="rounded-2xl border p-4 flex flex-col gap-3">
                    <div>
                      <p className="font-medium">Sign out</p>
                      <p className="text-sm text-muted-foreground">You’ll need to sign in again to access Exam Connect.</p>
                    </div>
                    <Button variant="secondary" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2"/>Logout</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {savedAt ? `Last saved at ${savedAt}` : "Make changes and hit Save."}
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

// ——— Reusable UI bits ———
function ToggleRow({ label, description, checked, onCheckedChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div>
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SelectRow({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
