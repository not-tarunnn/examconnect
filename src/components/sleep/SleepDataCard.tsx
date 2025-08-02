"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaBed, FaTimes } from "react-icons/fa";
import Image from "next/image";

import useSleepStore from "@/store/useSleepStore";

type APISegment = {
  startTimeNanos: string;
  endTimeNanos: string;
};

const SleepDataCard = () => {
  const {
    accessToken,
    sleepHours,
    setAccessToken,
    setSleepHours,
  } = useSleepStore();

  const [loading, setLoading] = useState(false);

  const fetchSleepData = async (token: string) => {
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000;

    const res = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.sleep.segment" }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        }),
      }
    );

    const data = await res.json();
    const segments: APISegment[] =
      data.bucket?.[0]?.dataset?.[0]?.point || [];

    const totalMillis = segments.reduce((acc, point) => {
      const start = Number(point.startTimeNanos);
      const end = Number(point.endTimeNanos);
      return acc + (end - start) / 1e6;
    }, 0);

    const hours = parseFloat((totalMillis / (1000 * 60 * 60)).toFixed(1));
    setSleepHours(hours);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        localStorage.setItem("google_access_token", token);
        setAccessToken(token);
        await fetchSleepData(token);
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const providerData = user.providerData[0];
        if (providerData?.providerId === "google.com") {
          const storedToken = accessToken || localStorage.getItem("google_access_token");
          if (storedToken) {
            setAccessToken(storedToken);
            if (!sleepHours) {
              await fetchSleepData(storedToken);
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Card className="backdrop-blur-md bg-black/30 border-none text-white hover:scale-105 transition-transform duration-200 w-full  h-30 relative">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle className="text-base text-white">Sleep Tracker</CardTitle>

        {/* {sleepHours !== null && (
          <button
            onClick={async () => {
              localStorage.removeItem("google_access_token");
              await signOut(auth);
              setSleepHours(null);
              setAccessToken(null);
            }}
            className="text-white hover:text-red-400 transition"
            title="Disconnect Google Fit"
          >
            <FaTimes size={16} />
          </button>
        )} */}
      </CardHeader>

      <CardContent>
        {sleepHours === null ? (
          <div className="flex items-center gap-5 space-x-3">
            <Image
              src="/watch1.webp"
              alt="Watch Icon"
              width={60}
              height={60}
              className="rounded-md translate-y-[-20%]"
            />
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="h-8 text-sm px-3 translate-y-[-1em] bg-white text-black hover:bg-gray-200 transition rounded-md flex items-center space-x-2"
            >
              <FaGoogle size={14} />
              <span>{loading ? "Connecting..." : "Connect Google"}</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 mt-2">
            <FaBed className="text-white" size={28} />
            <span className="text-white text-sm">
              Last night’s sleep:{" "}
              <span className="font-semibold">{sleepHours} hrs</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SleepDataCard;
