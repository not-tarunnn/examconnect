"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";

type User = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  countryFlag: string; // use emoji for demo
  avatar?: string; // optional avatar url
};

const demoUsers: User[] = [
  { id: "1", name: "Arjun Patel", age: 27, gender: "male", countryFlag: "🇮🇳" },
  { id: "2", name: "Maya Singh", age: 24, gender: "female", countryFlag: "🇮🇳" },
  { id: "3", name: "Liam Cooper", age: 31, gender: "male", countryFlag: "🇺🇸" },
  { id: "4", name: "Sofia Reyes", age: 22, gender: "female", countryFlag: "🇵🇭" },
  { id: "5", name: "Noah Brown", age: 29, gender: "male", countryFlag: "🇦🇺" },
  { id: "6", name: "Isha Verma", age: 20, gender: "female", countryFlag: "🇮🇳" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<"people" | "inbox">("people");
  const [filter, setFilter] = useState<"all" | "male" | "female">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return demoUsers;
    return demoUsers.filter((u) => u.gender === filter);
  }, [filter]);

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      {/* Sidebar - keep as the user had it */}
      <div className="fixed sm:relative top-0 left-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 transition-all duration-300 pl-0 sm:pl-0">
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Content wrapper: center small mobile-first panel and leave space for ads/header */}
        <div className="w-full flex justify-center py-6 px-4">
          <div
            className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden bg-[#161616]"
            aria-label="Talk to peers panel"
          >
            {/* Header / Title */}
            <div className="px-4 pt-6 pb-3 text-center">
              <h2 className="text-lg font-semibold">Talk to peers</h2>
              <p className="text-xs text-gray-400 mt-1">Connect with people online — mobile first</p>
            </div>

            {/* Tabs (people / inbox) */}
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTab("people")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                      tab === "people" ? "bg-gray-800" : "bg-transparent"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm">
                      👥
                    </div>
                    <span>{demoUsers.length}</span>
                  </button>

                  <button
                    onClick={() => setTab("inbox")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none ${
                      tab === "inbox" ? "bg-gray-800" : "bg-transparent"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm">
                      💬
                    </div>
                    <span>Inbox 0</span>
                  </button>
                </div>

                {/* small gear for settings placed top-right inside the panel */}
                <div className="text-gray-400 text-sm">⚙️</div>
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Filters */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm ${filter === "all" ? "bg-gray-800" : "bg-transparent"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("female")}
                  className={`px-3 py-1 rounded-full text-sm ${filter === "female" ? "bg-gray-800" : "bg-transparent"}`}
                >
                  ♀ Female
                </button>
                <button
                  onClick={() => setFilter("male")}
                  className={`px-3 py-1 rounded-full text-sm ${filter === "male" ? "bg-gray-800" : "bg-transparent"}`}
                >
                  ♂ Male
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* List: show people when tab=people, otherwise simple inbox placeholder */}
            <div className="max-h-72 overflow-auto">
              {tab === "people" ? (
                <ul>
                  {filtered.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between px-3 py-3 border-b border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-sm">{user.name.split(" ")[0][0]}</div>
                        <div className="leading-tight">
                          <div className={`text-sm font-semibold ${user.gender === "male" ? "text-sky-400" : "text-pink-400"}`}>{user.name}</div>
                          <div className="text-xs text-gray-400">{user.age} years</div>
                        </div>
                      </div>

                      <div className="text-sm pl-2">{user.countryFlag}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-400">No conversations yet — start one from the people tab.</div>
              )}
            </div>

            {/* footer spacer for mobile and leave room for ads above/below as requested */}
            <div className="px-3 py-4">
              <div className="text-xs text-gray-500 text-center">Space left above & below for ads/header.</div>
            </div>
          </div>
        </div>

        {/* leave a tall bottom padding so this panel doesn't fill the entire page */}
        <div className="h-24" />
      </div>
    </div>
  );
}
