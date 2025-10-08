"use client";

import React, { useEffect, useState } from "react";
import { Plus, Repeat, X } from "lucide-react";
import { useStreakStore } from "@/store/useStreakStore";
import { syncStreakToFirestore } from "@/lib/syncStreak";
import { auth, db, rtdb } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp as fsServerTimestamp } from "firebase/firestore";
import TaskCard from "@/components/task/TaskCard";
import type { Task } from "@/types/task";
import { useSidebarStore } from "@/store/useSidebarStore";
import { ref, onValue, update as rUpdate, remove as rRemove, serverTimestamp } from "firebase/database";
import InviteFriendsSection from "@/components/pomodoro/InviteFriendsSection";

interface PomodoroModalProps {
  onClose: () => void;
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ onClose }) => {
  const [sessionDuration, setSessionDuration] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number>(0);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [userTasks, setUserTasks] = useState<Task[]>([]);

  const { lastStreakDate, incrementStreak, setStreaksFromFirestore } = useStreakStore();
  const [hasLogged, setHasLogged] = useState(false);

  // Sidebar offset awareness
  const { collapsed } = useSidebarStore();

  // Aggregated stats state
  const [totals, setTotals] = useState({ today: 0, week: 0, month: 0, all: 0 });

  // Realtime room state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomEpochStartMs, setRoomEpochStartMs] = useState<number | null>(null);
  const [roomAccumulatedMs, setRoomAccumulatedMs] = useState<number>(0);

  // Local-only session trackers
  const [localEpochStartMs, setLocalEpochStartMs] = useState<number | null>(null);
  const [localAccumulatedMs, setLocalAccumulatedMs] = useState<number>(0);

  // Derived timeLeft (updates via interval)
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);

  // 🔹 Listen to streak document live
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const streakRef = doc(db, "streak", user.uid);
    const unsub = onSnapshot(streakRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
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

  // 🔹 Subscribe to user's pomodoro logs and compute aggregates
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "pomodoroLogs"), where("uid", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const day = (d: number) => (d === 0 ? 7 : d);
      const diffToMonday = day(now.getDay()) - 1;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let tToday = 0, tWeek = 0, tMonth = 0, tAll = 0;

      snap.forEach((doc) => {
        const data = doc.data() as any;
        const duration = Number(data.duration) || 0; // seconds
        const ts = (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate() : null;
        if (!ts || Number.isNaN(duration) || duration <= 0) return;
        tAll += duration;
        if (ts >= startOfMonth) tMonth += duration;
        if (ts >= startOfWeek) tWeek += duration;
        if (ts >= startOfToday) tToday += duration;
      });

      setTotals({ today: tToday, week: tWeek, month: tMonth, all: tAll });
    });

    return () => unsub();
  }, []);

  // Ensure we are a participant when we have a room
  useEffect(() => {
    const ensureSelf = async () => {
      const user = auth.currentUser;
      if (!user || !roomId) return;
      const s = await import("firebase/firestore");
      const snap = await s.getDoc(s.doc(db, "users", user.uid));
      const data = snap.data() as any;
      const username = data?.username || data?.fullName || user.uid;
      const profilePic = data?.profilePic || data?.profilePicture || data?.photoURL || null;
      const partRef = ref(rtdb, `pomodoroRooms/${roomId}/participants/${user.uid}`);
      await rUpdate(partRef, {
        username,
        profilePic,
      });
    };
    ensureSelf();
  }, [roomId]);

  // 🔹 If joined a room, subscribe to room state (mode, epochStartMs, accumulatedMs, durationSec)
  useEffect(() => {
    if (!roomId) return;
    const stateRef = ref(rtdb, `pomodoroRooms/${roomId}/state`);

    const offState = onValue(stateRef, (snap) => {
      const st = snap.val();
      if (!st) return;
      const mode = st.mode as string;
      const epochStartMs = typeof st.epochStartMs === "number" ? st.epochStartMs : null;
      const accumulatedMs = typeof st.accumulatedMs === "number" ? st.accumulatedMs : 0;
      const durationSec = typeof st.durationSec === "number" ? st.durationSec : sessionDuration;

      setSessionDuration(durationSec);
      setRoomEpochStartMs(epochStartMs);
      setRoomAccumulatedMs(accumulatedMs);
      setIsRunning(mode === "running");
    });

    return () => {
      offState();
    };
  }, [roomId]);

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

  // Recompute timeLeft every second from local clock
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let elapsedMs = 0;
      if (roomId) {
        elapsedMs = roomAccumulatedMs + (isRunning && roomEpochStartMs ? now - roomEpochStartMs : 0);
      } else {
        elapsedMs = localAccumulatedMs + (isRunning && localEpochStartMs ? now - localEpochStartMs : 0);
      }
      const nextLeft = Math.max(0, sessionDuration - Math.floor(elapsedMs / 1000));
      setTimeLeft(nextLeft);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roomId, isRunning, sessionDuration, roomEpochStartMs, roomAccumulatedMs, localEpochStartMs, localAccumulatedMs]);

  // Completion watcher
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handlePomodoroComplete();
      setIsRunning(false);
    }
  }, [timeLeft, isRunning]);

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

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const logPomodoroSession = async (duration: number, taskId: string | null) => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "pomodoroLogs"), {
      uid: user.uid,
      taskId: taskId || null,
      duration,
      createdAt: fsServerTimestamp(),
    });
  };

  const handleReset = async () => {
    if (!hasLogged && timeLeft < sessionDuration) {
      const durationSpent = sessionDuration - timeLeft;
      await logPomodoroSession(durationSpent, selectedTaskId);
      setHasLogged(true);
    }
    setIsRunning(false);
    if (roomId) {
      await rUpdate(ref(rtdb, `pomodoroRooms/${roomId}/state`), {
        mode: "reset",
        epochStartMs: null,
        accumulatedMs: 0,
        updatedAt: serverTimestamp(),
      });
    }
    setLocalEpochStartMs(null);
    setLocalAccumulatedMs(0);
  };

  const handlePomodoroComplete = async () => {
    if (hasLogged) return;

    const now = new Date();
    const todayISO = new Date(now.toDateString()).toISOString();
    const last = lastStreakDate ? new Date(lastStreakDate) : null;
    const isSameDay = last && new Date(last.toDateString()).toISOString() === todayISO;

    if (!isSameDay) {
      incrementStreak(todayISO);
      await syncStreakToFirestore();
    }

    await logPomodoroSession(sessionDuration, selectedTaskId);
    setHasLogged(true);

    if (roomId) {
      const delta = roomEpochStartMs ? Date.now() - roomEpochStartMs : 0;
      await rUpdate(ref(rtdb, `pomodoroRooms/${roomId}/state`), {
        mode: "paused",
        epochStartMs: null,
        accumulatedMs: roomAccumulatedMs + delta,
        updatedAt: serverTimestamp(),
      });
    }
  };

  // Ensure partial logging on close/tab unload for local sessions
  useEffect(() => {
    const handleUnload = async () => {
      if (!roomId && (isRunning || timeLeft < 25 * 60)) {
        const durationSpent = sessionDuration - timeLeft;
        if (durationSpent > 0) {
          await logPomodoroSession(durationSpent, selectedTaskId);
        }
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [roomId, isRunning, timeLeft, sessionDuration, selectedTaskId]);

  // Unified exit handler
  const exitModal = async () => {
    if (!hasLogged && (isRunning || timeLeft < sessionDuration)) {
      const durationSpent = sessionDuration - timeLeft;
      if (durationSpent > 0) await logPomodoroSession(durationSpent, selectedTaskId);
    }
    const user = auth.currentUser;
    if (roomId && user) {
      const partRef = ref(rtdb, `pomodoroRooms/${roomId}/participants/${user.uid}`);
      await rRemove(partRef);
      const partsRef = ref(rtdb, `pomodoroRooms/${roomId}/participants`);
      const s = await (await import("firebase/database")).get(partsRef);
      if (!s.exists()) await rRemove(ref(rtdb, `pomodoroRooms/${roomId}`));
      setRoomId(null);
    }
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void exitModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasLogged, isRunning, timeLeft, sessionDuration, selectedTaskId, roomId]);

  return (
    <div role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) { void exitModal(); } }} className="fixed inset-0 z-[100] bg-[#0e0e0e] text-white flex flex-col items-center justify-center p-6">
      <button onClick={() => { void exitModal(); }} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition">
        <X className="w-7 h-7" />
      </button>

      <div className="absolute top-1 left-20 max-w-xl">{selectedTask && <TaskCard task={selectedTask} />}</div>

      {!selectedTask ? (
        <button onClick={() => setShowTaskPicker(true)} className="absolute top-5 right-20 p-2 rounded-full bg-white hover:bg-gray-200 text-black shadow">
          <Plus className="w-5 h-5" />
        </button>
      ) : (
        <button onClick={() => setShowTaskPicker(true)} className="absolute top-5 right-20 p-2 rounded-full bg-white hover:bg-gray-200 text-black shadow">
          <Repeat className="w-5 h-5" />
        </button>
      )}

      <button
        onClick={async () => {
          if (!roomId) {
            if (!isRunning) {
              setLocalEpochStartMs(Date.now());
            } else {
              setLocalAccumulatedMs((prev) => prev + (localEpochStartMs ? Date.now() - localEpochStartMs : 0));
              setLocalEpochStartMs(null);
            }
            setIsRunning(!isRunning);
            return;
          }
          // ensure we are a participant (host control reliability)
          const user = auth.currentUser;
          if (user) {
            const s = await import("firebase/firestore");
            const snap = await s.getDoc(s.doc(db, "users", user.uid));
            const data = snap.data() as any;
            const username = data?.username || data?.fullName || user.uid;
            const profilePic = data?.profilePic || data?.profilePicture || data?.photoURL || null;
            await rUpdate(ref(rtdb, `pomodoroRooms/${roomId}/participants/${user.uid}`), { username, profilePic });
          }
          const stateRef = ref(rtdb, `pomodoroRooms/${roomId}/state`);
          if (!isRunning) {
            const now = Date.now();
            setIsRunning(true);
            setRoomEpochStartMs(now);
            await rUpdate(stateRef, {
              mode: "running",
              epochStartMs: now,
              updatedAt: serverTimestamp(),
            });
          } else {
            const now = Date.now();
            const delta = roomEpochStartMs ? now - roomEpochStartMs : 0;
            setIsRunning(false);
            setRoomEpochStartMs(null);
            setRoomAccumulatedMs(roomAccumulatedMs + delta);
            await rUpdate(stateRef, {
              mode: "paused",
              epochStartMs: null,
              accumulatedMs: roomAccumulatedMs + delta,
              updatedAt: serverTimestamp(),
            });
          }
        }}
        className="w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-white/90 text-black flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95"
      >
        <span className="text-[48px] sm:text-[64px] font-bold tracking-widest">{formatTime(timeLeft)}</span>
      </button>

      <button
        onClick={handleReset}
        className="mt-10 px-10 py-4 text-xl rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 transition-all text-white shadow-md"
      >
        Reset
      </button>

      <div className="mt-6 flex gap-4">
        {[25, 35, 55].map((minutes) => (
          <button
            key={minutes}
            onClick={async () => {
              const secs = minutes * 60;
              setIsRunning(false);
              setLocalEpochStartMs(null);
              setLocalAccumulatedMs(0);
              setRoomEpochStartMs(null);
              setRoomAccumulatedMs(0);
              setTimeLeft(secs);
              setSessionDuration(secs);
              setHasLogged(false);
              if (roomId) {
                await rUpdate(ref(rtdb, `pomodoroRooms/${roomId}/state`), {
                  durationSec: secs,
                  updatedAt: serverTimestamp(),
                });
              }
            }}
            className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-bold"
          >
            {minutes}
          </button>
        ))}

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (customMinutes && customMinutes > 0) {
                const secs = customMinutes * 60;
                setIsRunning(false);
                setLocalEpochStartMs(null);
                setLocalAccumulatedMs(0);
                setRoomEpochStartMs(null);
                setRoomAccumulatedMs(0);
                setTimeLeft(secs);
                setSessionDuration(secs);
                setHasLogged(false);
                if (roomId) {
                  await rUpdate(ref(rtdb, `pomodoroRooms/${roomId}/state`), {
                    durationSec: secs,
                    updatedAt: serverTimestamp(),
                  });
                }
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

      <p className="mt-6 text-gray-400 text-center text-sm max-w-md">Tap the circle to start/pause. Complete 25 mins to earn your daily streak.</p>

      <div className={`absolute ${collapsed ? "left-20" : "left-64"} bottom-4 text-white w-[14rem]`}>
        <InviteFriendsSection roomId={roomId} onRoomIdChange={setRoomId} />

        <div className="bg-transparent border border-white/20 rounded-xl px-4 py-3 w-full">
          <div className="text-xs uppercase tracking-wider text-white/60 mb-2">Study time</div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Today</span>
              <span className="font-mono">{formatDuration(totals.today)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">This week</span>
              <span className="font-mono">{formatDuration(totals.week)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">This month</span>
              <span className="font-mono">{formatDuration(totals.month)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">All time</span>
              <span className="font-mono">{formatDuration(totals.all)}</span>
            </div>
          </div>
        </div>
      </div>

      {showTaskPicker && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur flex flex-col items-center justify-center z-50  p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">Select a Task</h2>
            <div className="max-h-[65vh] overflow-y-auto pr-2 -mr-2" style={{ scrollbarWidth: "none" }}>
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
            <button onClick={() => setShowTaskPicker(false)} className="w-full mt-2 text-sm text-gray-400 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroModal;
