"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SleepEntry {
  id: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  score: number;
  date: string; // YYYY-MM-DD
}

export default function SleepTracker() {
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayEntry, setTodayEntry] = useState<SleepEntry | null>(null);
  const [isPastDay, setIsPastDay] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newSleepTime, setNewSleepTime] = useState(""); // Store the updated time

  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD


  
  // Track auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Fetch today's entry
  useEffect(() => {
    const fetchTodayEntry = async () => {
      if (!user) return;

      const q = query(
        collection(db, "sleepData"),
        where("uid", "==", user.uid),
        where("date", "==", todayDate)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data() as Omit<SleepEntry, "id">;
        setTodayEntry({ ...data, id: docSnap.id });
        setSleepTime(data.sleepTime);
        setWakeTime(data.wakeTime);
        setDuration(data.duration);
        setScore(data.score);
      } else {
        setTodayEntry(null);
      }
    };

    fetchTodayEntry();
  }, [user, todayDate]);

  // Calculate sleep duration & score
  const calculateSleep = () => {
    if (!sleepTime || !wakeTime) return;

    const sleepDate = new Date(`1970-01-01T${sleepTime}:00`);
    let wakeDate = new Date(`1970-01-01T${wakeTime}:00`);

    if (wakeDate <= sleepDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const diffMs = wakeDate.getTime() - sleepDate.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    setDuration(hours);
    const newScore = Math.min(100, Math.max(0, (hours / 8) * 100));
    setScore(Number(newScore.toFixed(1)));
  };

  // Save or update
const saveSleepData = async () => {
  if (!user) {
    alert("Please log in first.");
    return;
  }
  if (!sleepTime || !wakeTime) {
    alert("Please select both sleep and wake time.");
    return;
  }

  // 🔹 Calculate sleep duration & score before saving
  const sleepDate = new Date(`1970-01-01T${sleepTime}:00`);
  let wakeDate = new Date(`1970-01-01T${wakeTime}:00`);
  if (wakeDate <= sleepDate) {
    wakeDate.setDate(wakeDate.getDate() + 1);
  }
  const diffMs = wakeDate.getTime() - sleepDate.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  const calcScore = Math.min(100, Math.max(0, (hours / 8) * 100));

  setDuration(hours);
  setScore(Number(calcScore.toFixed(1)));

  setLoading(true);
  try {
    const q = query(
      collection(db, "sleepData"),
      where("uid", "==", user.uid),
      where("date", "==", todayDate)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        sleepTime,
        wakeTime,
        duration: hours,
        score: Number(calcScore.toFixed(1)),
        updatedAt: serverTimestamp(),
      });
      alert("Today's sleep data updated!");
    } else {
      await addDoc(collection(db, "sleepData"), {
        uid: user.uid,
        sleepTime,
        wakeTime,
        duration: hours,
        score: Number(calcScore.toFixed(1)),
        date: todayDate,
        createdAt: serverTimestamp(),
      });
      alert("Sleep data saved!");
    }
  } catch (err) {
    console.error("Error saving sleep data:", err);
  } finally {
    setLoading(false);
  }
};


  // Check if it's past today
  useEffect(() => {
    if (todayEntry) {
      const nowDate = new Date().toISOString().split("T")[0];
      setIsPastDay(todayEntry.date !== nowDate);
    }
  }, [todayEntry]);


  const handleUpdateTime = async () => {
  try {
    if (!user || !todayEntry) return;

    // Use current values from modal
    const updatedSleep = newSleepTime || todayEntry.sleepTime;
    const updatedWake = wakeTime || todayEntry.wakeTime;

    // Recalculate duration and score
    const sleepDate = new Date(`1970-01-01T${updatedSleep}:00`);
    let wakeDate = new Date(`1970-01-01T${updatedWake}:00`);
    if (wakeDate <= sleepDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }
    const diffMs = wakeDate.getTime() - sleepDate.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    const calcScore = Math.min(100, Math.max(0, (hours / 8) * 100));

    // Update in Firestore
    const docRef = doc(db, "sleepData", todayEntry.id);
    await updateDoc(docRef, {
      sleepTime: updatedSleep,
      wakeTime: updatedWake,
      duration: hours,
      score: Number(calcScore.toFixed(1)),
      updatedAt: serverTimestamp(),
    });

    // Update local state for UI
    setTodayEntry((prev) =>
      prev
        ? {
            ...prev,
            sleepTime: updatedSleep,
            wakeTime: updatedWake,
            duration: hours,
            score: Number(calcScore.toFixed(1)),
          }
        : prev
    );

    setUpdateModalOpen(false);
  } catch (error) {
    console.error("Error updating time:", error);
  }
};


return (
  <div className="max-w-md mx-auto p-4 rounded-lg shadow">
    {!todayEntry ? (
      <>
        <div className="mb-1">
          <label className="block text-sm font-medium">Today's Sleep Time</label>
          <Input
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
          />
        </div>

        <div className="mb-0">
          <label className="block text-sm font-medium">Today's Wake Time</label>
          <Input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={saveSleepData} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </>
    ) : (
      <div className="text-center">
        <h2 className="text-lg font-semibold">Hope you had a good sleep 😴</h2>
        {!isPastDay && (
          <>
            <p className="text-sm text-gray-500 mb-3">
              You can update today's entry if needed.
            </p>
            <Button 
  className="bg-white text-black hover:bg-black hover:text-white" 
  onClick={() => {
  setNewSleepTime(todayEntry.sleepTime); // preload
  setWakeTime(todayEntry.wakeTime); // preload
  setUpdateModalOpen(true);
}}

>
  Update Time
</Button>

{updateModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-[#161616] text-white rounded-xl shadow-lg p-6 w-[350px] translate-y-[-2rem]">
      
      {/* Sleep Time Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Today's Sleep Time</label>
        <input
          type="time"
          value={newSleepTime}
          onChange={(e) => setNewSleepTime(e.target.value)}
          className="w-full p-2 rounded bg-[#181818] border border-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Wake Time Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Today's Wake Time</label>
        <input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="w-full p-2 rounded bg-[#181818] border border-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          className="bg-white text-black hover:bg-gray-300"
          onClick={handleUpdateTime} // Use your extracted function here
        >
          Save
        </Button>

        <Button
          variant="outline"
          className="bg-white text-black hover:bg-gray-300"
          onClick={() => setUpdateModalOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
)}

          </>
        )}
      </div>
    )}
  </div>
);
}
