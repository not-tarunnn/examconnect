"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useStreakStore } from "@/store/useStreakStore";
import { syncStreakToFirestore } from "@/lib/syncStreak";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PomodoroModalProps {
  onClose: () => void;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25*60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);

  const {
    lastStreakDate,
    incrementStreak,
    setStreaksFromFirestore,
  } = useStreakStore();

  // 🔄 Load streak data from Firestore once when modal opens
  useEffect(() => {
  const loadStreak = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "streak", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      setStreaksFromFirestore(
        data.streak || 0,
        data.longestStreak || 0,
        data.lastStreakDate || null
      );
    } else {
      // 👇 Reset Zustand if no streak data exists in Firestore
      useStreakStore.getState().resetStreak();
    }
  };

  loadStreak();
}, [setStreaksFromFirestore]);

  // 🧠 Pomodoro timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // ✅ Detect when Pomodoro completes
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handlePomodoroComplete();
      setIsRunning(false);
    }
  }, [timeLeft, isRunning]);

  // 🎯 Format time nicely
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // 🔁 Reset Pomodoro
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25*60);
  };

  // ⭐ When Pomodoro completes
  const handlePomodoroComplete = async () => {
    const now = new Date();
    const todayISO = new Date(now.toDateString()).toISOString(); // Midnight today
    const last = lastStreakDate ? new Date(lastStreakDate) : null;

    const isSameDay =
      last &&
      new Date(last.toDateString()).toISOString() === todayISO;

    if (!isSameDay) {
      incrementStreak(todayISO);
      await syncStreakToFirestore(); // sync with Firestore
    }
  };

return (
  <div className="fixed inset-0 z-50 bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-6">
      {/* 🔄 Background Video */}
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover z-[-99999] opacity-30"
    >
      <source src="/bg.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    {/* Close Button */}
    <button
      onClick={onClose}
      className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition"
    >
      <X className="w-7 h-7" />
    </button>


    {/* Timer */}
    <div className="text-[72px] sm:text-[96px] font-bold tracking-widest mb-12">
      {formatTime(timeLeft)}
    </div>

    {/* Controls */}
    <div className="flex flex-wrap justify-center gap-6">
      <button
        onClick={() => setIsRunning(!isRunning)}
        className={`px-10 py-4 text-xl rounded-xl font-semibold transition-all shadow-md ${
          isRunning
            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
      <button
        onClick={handleReset}
        className="px-10 py-4 text-xl rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 transition-all text-white shadow-md"
      >
        Reset
      </button>
    </div>

    {/* Tip or Streak Info Placeholder */}
    <p className="mt-12 text-gray-400 text-center text-sm max-w-md">
      Stay focused for 25 uninterrupted minutes to earn your daily streak.
    </p>
  </div>
);
}

export default PomodoroModal;
