"use client";

import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import React from "react";

const DATA = [
  { name: "Aarav Singh", streak: 23, week: 18, today: 3 },
  { name: "Neha Patel", streak: 20, week: 15, today: 2 },
  { name: "Rohit Sharma", streak: 18, week: 12, today: 1 },
  { name: "Ishita Mehta", streak: 14, week: 10, today: 1 },
  { name: "Vikram Rao", streak: 12, week: 8, today: 0.5 },
  { name: "Mehul Jain", streak: 9, week: 6, today: 0.5 },
  { name: "Kiran Das", streak: 7, week: 5, today: 1 },
  { name: "Sana Verma", streak: 6, week: 4.5, today: 0.25 },
  { name: "Arjun Kapoor", streak: 5, week: 4, today: 0 },
  { name: "Priya Rao", streak: 4, week: 3, today: 0.75 },
];

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
  return (
    <div className="flex min-h-screen bg-[#181818]">
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
                {DATA.map((u, idx) => {
                  const style = rankStyles(idx);
                  return (
                    <li
                      key={u.name}
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
                            {u.name}
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
                            {u.week}h
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-zinc-400 text-xs">Today</div>
                          <div className="text-zinc-100 font-semibold">
                            {u.today}h
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
