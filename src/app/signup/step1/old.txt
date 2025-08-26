"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FaUser, FaPen } from "react-icons/fa6";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import getCroppedImg from "@/lib/cropImage"; // We'll write this helper below
import { Area } from "react-easy-crop";

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

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

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

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex flex-col items-center relative">
      {/* Profile Image Circle */}
      <div className="flex flex-col items-center mb-6 relative">
        <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
          ) : (
            <FaUser className="text-4xl text-gray-400" />
          )}
        </div>
        {/* Icon button outside the image */}
        <label className="absolute top-[7rem] right-[calc(50%-4rem)] bg-black rounded-full p-2 cursor-pointer border border-white shadow-lg">
          <FaPen className="text-sm text-white" />
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </label>
      </div>

      {/* Form Fields */}
      <div className="w-full max-w-lg space-y-6">
        <input
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
        />

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
        />

        <div className="flex gap-4">
          <input
            type="date"
            value={dob}
            onChange={(e) => setField("dob", e.target.value)}
            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />

          <select
            value={gender}
            onChange={(e) => setField("gender", e.target.value)}
            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <textarea
          placeholder="Short Bio"
          value={bio}
          onChange={(e) => setField("bio", e.target.value)}
          className="w-full px-4 py-3 h-28 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <button
            disabled={checkingUsername}
            onClick={handleNext}
            className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-full hover:shadow-lg hover:translate-y-[-2px] transition duration-200 hover:bg-blue-50"
          >
            {checkingUsername ? "Checking..." : "Next →"}
          </button>
        </div>
      </div>

      {/* Cropper Dialog */}
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
            <button
              onClick={handleCropSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Crop & Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}