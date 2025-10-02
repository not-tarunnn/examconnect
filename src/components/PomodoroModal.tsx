"use client";

import React, { useEffect, useState } from "react";
import { Plus, Repeat, X } from "lucide-react";
import { useStreakStore } from "@/store/useStreakStore";
import { syncStreakToFirestore } from "@/lib/syncStreak";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import TaskCard from "@/components/task/TaskCard";
import type { Task } from "@/types/task";

interface PomodoroModalProps {
  onClose: () => void;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number>(0);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [userTasks, setUserTasks] = useState<Task[]>([]);

  const { lastStreakDate, incrementStreak, setStreaksFromFirestore } = useStreakStore();
  const [hasLogged, setHasLogged] = useState(false);

  // 🔹 Listen to streak document live
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const streakRef = doc(db, "streak", user.uid);
    const unsub = onSnapshot(streakRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStreaksFromFirestore(
          data.streak || 0,
          data.longestStreak || 0,
          data.lastStreakDate || null
        );
      } else {
        useStreakStore.getState().resetStreak();
      }
    });

    return () => unsub();
  }, [setStreaksFromFirestore]);

  // 🔹 Listen to all tasks for the logged-in user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((docSnap) => {
        const { id: _ignored, ...rest } = docSnap.data() as Task;
        tasksData.push({ id: docSnap.id, ...rest });
      });
      setUserTasks(tasksData);
    });

    return () => unsub();
  }, []);

  // 🔹 Live-listen to the selected task only
  useEffect(() => {
    if (!selectedTaskId) return;
    const unsub = onSnapshot(doc(db, "tasks", selectedTaskId), (snap) => {
      if (snap.exists()) {
        const { id: _ignored, ...rest } = snap.data() as Task;
        setSelectedTask({ id: snap.id, ...rest });
      } else {
        setSelectedTask(null);
      }
    });
    return () => unsub();
  }, [selectedTaskId]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Handle pomodoro completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handlePomodoroComplete();
      setIsRunning(false);
    }
  }, [timeLeft, isRunning]);


  useEffect(() => {
  const handleUnload = async () => {
    if (isRunning || timeLeft < 25 * 60) {
      const durationSpent = (25 * 60) - timeLeft;
      if (durationSpent > 0) {
        await logPomodoroSession(durationSpent, selectedTaskId);
      }
    }
  };

  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
}, [isRunning, timeLeft, selectedTaskId]);


  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600).toString().padStart(1, "0");
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      return `${hrs}:${mins}:${secs}`;
    } else {
      const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      return `${mins}:${secs}`;
    }
  };

  const logPomodoroSession = async (duration: number, taskId: string | null) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "pomodoroLogs"), {
    uid: user.uid,
    taskId: taskId || null,
    duration, // in seconds
    createdAt: serverTimestamp(),
  });
};

const handleReset = async () => {
  if (!hasLogged && timeLeft < sessionDuration) {
    const durationSpent = sessionDuration - timeLeft;
    await logPomodoroSession(durationSpent, selectedTaskId);
    setHasLogged(true);
  }
  setIsRunning(false);
  setTimeLeft(sessionDuration); // reset to planned duration
};


const handlePomodoroComplete = async () => {
  if (hasLogged) return;

  // streak logic (same as before)
  const now = new Date();
  const todayISO = new Date(now.toDateString()).toISOString();
  const last = lastStreakDate ? new Date(lastStreakDate) : null;
  const isSameDay = last && new Date(last.toDateString()).toISOString() === todayISO;

  if (!isSameDay) {
    incrementStreak(todayISO);
    await syncStreakToFirestore();
  }

  // Log full session duration
  await logPomodoroSession(sessionDuration, selectedTaskId);
  setHasLogged(true);
};

const handleClose = async () => {
  if (!hasLogged && (isRunning || timeLeft < sessionDuration)) {
    const durationSpent = sessionDuration - timeLeft;
    if (durationSpent > 0) {
      await logPomodoroSession(durationSpent, selectedTaskId);
      setHasLogged(true);
    }
  }
  onClose();
};


  return (
    <div className="fixed inset-0 z-[100] bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-6">
      {/* ❌ Close Button */}
    <button
      onClick={handleClose}
      className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition"
    >
      <X className="w-7 h-7" />
    </button>

      {/* ✅ Selected Task Display (Top-left) */}
      <div className="absolute top-3 left-24 max-w-xl">
        {selectedTask && <TaskCard task={selectedTask} />}
      </div>


      {/* ➕ Add Task Button */}
{!selectedTask ? (
  <button
    onClick={() => setShowTaskPicker(true)}
    className="absolute top-5 right-20 p-2 rounded-full bg-white hover:bg-gray-200 text-black shadow"
  >
    <Plus className="w-5 h-5" />
  </button>
) : (
  <button
    onClick={() => setShowTaskPicker(true)}
    className="absolute top-5 right-20 p-2 rounded-full bg-white hover:bg-gray-200 text-black shadow"
  >
    <Repeat className="w-5 h-5" />
  </button>
)}




      {/* 🔁 Pomodoro Timer */}
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-white/90 text-black flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95"
      >
        <span className="text-[48px] sm:text-[64px] font-bold tracking-widest">
          {formatTime(timeLeft)}
        </span>
      </button>

      {/* 🔄 Reset Button */}
<button
  onClick={handleReset}
  className="mt-10 px-10 py-4 text-xl rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 transition-all text-white shadow-md"
>
  Reset
</button>

{/* ⏳ Timer Presets */}
<div className="mt-6 flex gap-4">
  {[25, 35, 55].map((minutes) => (
    <button
      key={minutes}
      onClick={() => {
        setIsRunning(false);
        setTimeLeft(minutes * 60);
        setSessionDuration(minutes * 60); // 👈 track planned duration
        setHasLogged(false);              // 👈 reset logging for new session
      }}
      className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold"
    >
      {minutes}
    </button>
  ))}


  {/* Custom Time Input & Button */}
<div className="flex items-center gap-2">
   <button
  onClick={() => {
    if (customMinutes && customMinutes > 0) {
      const secs = customMinutes * 60;
      setIsRunning(false);
      setTimeLeft(secs);
      setSessionDuration(secs); // track duration
      setHasLogged(false);
    }
  }}
  className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-black font-bold"
>
  ⌛
</button>

  <input
    type="number"
    min={1}
    placeholder="mins"
    className="w-20 px-2 py-1 rounded-md border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
    value={customMinutes}
    onChange={(e) => setCustomMinutes(Number(e.target.value))}
  />

</div>

</div>


      {/* 🧠 Tip / Info */}
      <p className="mt-6 text-gray-400 text-center text-sm max-w-md">
        Tap the circle to start/pause. Complete 25 mins to earn your daily streak.
      </p>

      {/* 📋 Task Selection Modal */}
      {showTaskPicker && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur flex flex-col items-center justify-center z-50  p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">Select a Task</h2>
            <div
              className="max-h-[65vh] overflow-y-auto pr-2 -mr-2"
              style={{ scrollbarWidth: "none" }}
            >
              {userTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskPicker(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition mb-2 last:mb-0"
                >
                  {task.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTaskPicker(false)}
              className="w-full mt-2 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroModal;
