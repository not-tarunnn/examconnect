"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaUser, FaPen } from "react-icons/fa6";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import getCroppedImg from "@/lib/cropImage"; // unchanged helper
import { Area } from "react-easy-crop";

// UI components (shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Step1() {
  const router = useRouter();
  const {
    username,
    fullName,
    gender,
    dob,
    bio,
    profilePic,
    setField,
  } = useOnboardingStore();

  // state (unchanged in spirit)
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  // logic (kept the same functionality)
  const checkUsernameUnique = async () => {
    if (!username) return setError("Username is required");
    setCheckingUsername(true);
    const ref = doc(db, "usernames", username);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setError("Username already taken");
      setCheckingUsername(false);
      return false;
    }
    setError("");
    setCheckingUsername(false);
    return true;
  };

  const handleNext = async () => {
    const isUnique = await checkUsernameUnique();
    if (isUnique) {
      router.push("/signup/step2");
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (imageSrc && croppedArea) {
      const croppedImage = await getCroppedImg(imageSrc, croppedArea);
      setField("profilePic", croppedImage);
    }
    setShowCropper(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setField("username", formatted);
  };

  // Animation helpers
  const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Create your profile</h1>
              <p className="text-sm text-muted-foreground mt-1">Step 1 of 3 — basic info & avatar</p>
            </div>
            <div className="hidden sm:block text-sm text-muted-foreground">Onboarding</div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/3 bg-primary/80" />
          </div>
        </motion.header>

        {/* Card */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Tell us about you</CardTitle>
              <CardDescription>Pick a username, add your name, and upload a profile photo.</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Avatar + form grid */}
              <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-6 items-start">
                {/* Avatar */}
                <motion.div variants={fadeIn} className="flex flex-col items-center sm:items-start">
  {/* wrapper without overflow-hidden */}
  <div className="relative inline-block">
    {/* circle keeps overflow-hidden */}
    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
      {profilePic ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePic}
          alt="Profile"
          className="object-cover w-full h-full"
        />
      ) : (
        <FaUser className="text-4xl text-muted-foreground" />
      )}
    </div>

    {/* pencil placed OUTSIDE */}
    <label className="absolute bottom-3 right-3 translate-x-1/4 translate-y-1/4 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md hover:shadow-lg transition">
      <FaPen className="text-xs" />
      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="hidden"
      />
    </label>
  </div>

  <p className="text-xs text-muted-foreground mt-2">
    JPG/PNG, square image works best.
  </p>
</motion.div>


                {/* Form fields */}
                <div className="space-y-5">
                  <motion.div variants={fadeIn}>
                    <Label htmlFor="username">Username</Label>
                    <div className="mt-1">
                      <Input
                        id="username"
                        placeholder="e.g., study_master"
                        value={username}
                        onChange={handleUsernameChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, and underscores only.</p>
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="mt-1">
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dob">Date of birth</Label>
                      <div className="mt-1">
                        <Input
                          type="date"
                          id="dob"
                          value={dob}
                          onChange={(e) => setField("dob", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <div className="mt-1">
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setField("gender", e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <Label htmlFor="bio">Short bio</Label>
                    <div className="mt-1">
                      <Textarea
                        id="bio"
                        placeholder="A sentence about you"
                        value={bio}
                        onChange={(e) => setField("bio", e.target.value)}
                        className="h-28"
                      />
                    </div>
                  </motion.div>

                  {error && (
                    <motion.p variants={fadeIn} className="text-sm text-destructive">
                      {error}
                    </motion.p>
                  )}

                  <Separator className="my-2" />

                  <motion.div variants={fadeIn} className="flex justify-end pt-2">
                    <Button
                      variant="default"
                      disabled={checkingUsername}
                      onClick={handleNext}
                      className="rounded-full px-5"
                    >
                      {checkingUsername ? "Checking…" : "Next →"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cropper Dialog (unchanged functionality) */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="p-0 overflow-hidden max-w-xl w-full">
          <DialogTitle className="sr-only">Crop Image</DialogTitle>
          {imageSrc && (
            <div className="relative w-full h-[400px] flex flex-col">
              <div className="relative flex-1">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="px-6 py-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end p-4 border-t">
            <Button onClick={handleCropSave}>Crop & Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
