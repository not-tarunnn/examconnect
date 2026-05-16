"use client";

import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";

interface LeaderboardUser {
  uid: string;
  fullName: string;
  streak: number;
  weekHours: number;
  todayHours: number;
}

interface PomodoroLog {
  uid: string;
  duration: number;
  createdAt: Timestamp;
}

const rankStyles = (i: number) => {
  if (i === 0)
    return {
      text: "text-[#FFD54A]",
      glow: "shadow-[0_6px_20px_rgba(255,213,74,0.08)]",
      medal: "🥇",
    };
  if (i === 1)
    return {
      text: "text-[#C7C7C7]",
      glow: "shadow-[0_6px_20px_rgba(199,199,199,0.06)]",
      medal: "🥈",
    };
  if (i === 2)
    return {
      text: "text-[#CD7F32]",
      glow: "shadow-[0_6px_20px_rgba(205,127,50,0.06)]",
      medal: "🥉",
    };
  return { text: "text-zinc-400", glow: "", medal: "" };
};

export default function LeaderBoard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const logsSnapshot = await getDocs(collection(db, "pomodoroLogs"));
        const usersSnapshot = await getDocs(collection(db, "users"));

        const userMap = new Map<string, { fullName: string }>();
        usersSnapshot.docs.forEach((doc) => {
          userMap.set(doc.id, { fullName: doc.data().fullName || "Unknown User" });
        });

        const logsPerUser = new Map<string, PomodoroLog[]>();
        logsSnapshot.docs.forEach((doc) => {
          const log = doc.data() as PomodoroLog;
          if (!logsPerUser.has(log.uid)) {
            logsPerUser.set(log.uid, []);
          }
          logsPerUser.get(log.uid)!.push(log);
        });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffToMonday = (now.getDay() === 0 ? 7 : now.getDay()) - 1;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

        const leaderboard: LeaderboardUser[] = [];

        logsPerUser.forEach((logs, uid) => {
          const userData = userMap.get(uid);
          if (!userData) return;

          const sortedLogs = logs.sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });

          let todayHours = 0;
          let weekHours = 0;
          let streak = 0;
          const uniqueDays = new Set<string>();

          for (const log of sortedLogs) {
            const logDate = log.createdAt instanceof Timestamp ? log.createdAt.toDate() : new Date(log.createdAt);
            const durationHours = (log.duration || 0) / 3600;

            if (logDate >= startOfToday) {
              todayHours += durationHours;
            }
            if (logDate >= startOfWeek) {
              weekHours += durationHours;
            }

            const dateKey = logDate.toISOString().split("T")[0];
            uniqueDays.add(dateKey);
          }

          const sortedDays = Array.from(uniqueDays)
            .sort()
            .reverse();

          if (sortedDays.length > 0) {
            let currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            for (const dayStr of sortedDays) {
              const logDate = new Date(dayStr);
              const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays === 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
              } else if (diffDays === 1) {
                streak++;
                currentDate = logDate;
              } else {
                break;
              }
            }
          }

          leaderboard.push({
            uid,
            fullName: userData.fullName,
            streak,
            weekHours: Math.round(weekHours * 10) / 10,
            todayHours: Math.round(todayHours * 10) / 10,
          });
        });

        leaderboard.sort((a, b) => b.streak - a.streak);
        setUsers(leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const displayUsers = users.length > 0 ? users : [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="fixed sm:relative top-0 left-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 transition-all duration-300 pl-0 sm:pl-0">
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Leaderboard Section */}
        <main className="flex flex-col items-center justify-start flex-1 px-4 py-10">
          <div className="w-full max-w-4xl">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-[#202020]">
              {/* Headings */}
              <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-zinc-800 text-zinc-400 text-sm">
                <div className="flex items-center gap-4 w-1/2">
                  <div className="w-8 text-center">#</div>
                  <div>Name</div>
                </div>
                <div className="flex gap-12 items-center w-1/2 justify-end">
                  <div className="w-28 text-right">Streak</div>
                  <div className="w-28 text-right">This week</div>
                  <div className="w-28 text-right">Today</div>
                </div>
              </div>

              {/* List */}
              <ul className="divide-y divide-zinc-800">
                {loading ? (
                  <li className="px-6 py-4 text-center text-zinc-400">
                    Loading leaderboard...
                  </li>
                ) : displayUsers.length === 0 ? (
                  <li className="px-6 py-4 text-center text-zinc-400">
                    No users yet
                  </li>
                ) : (
                  displayUsers.map((u, idx) => {
                    const style = rankStyles(idx);
                    return (
                      <li
                        key={u.uid}
                        className={`flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-[#252525] transition-colors ${style.glow}`}
                      >
                        {/* Left: rank + name */}
                        <div className="flex items-center gap-4 sm:gap-6 w-1/2">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-md font-medium text-sm ${style.text}`}
                          >
                            <span>{style.medal ? style.medal : idx + 1}</span>
                          </div>

                          <div>
                            <div className="text-zinc-100 font-medium leading-tight">
                              {u.fullName}
                            </div>
                            <div className="text-zinc-500 text-xs mt-0.5">
                              {idx === 0 ? "Top learner" : "Learner"}
                            </div>
                          </div>
                        </div>

                        {/* Right: stats */}
                        <div className="flex flex-col md:flex-row gap-3 md:gap-8 items-end w-1/2 justify-end">
                          <div className="text-right">
                            <div className="text-zinc-400 text-xs">Streak</div>
                            <div className="text-zinc-100 font-semibold">
                              {u.streak}d
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-zinc-400 text-xs">This week</div>
                            <div className="text-zinc-100 font-semibold">
                              {u.weekHours}h
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-zinc-400 text-xs">Today</div>
                            <div className="text-zinc-100 font-semibold">
                              {u.todayHours}h
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
