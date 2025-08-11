"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import { Flame } from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useStreakStore } from "@/store/useStreakStore";
import { fetchStreakFromFirestore } from "@/lib/fetchStreak";
const TABS = ["stats", "habits", "streak", "tasks", "achievements"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("stats");
  const { collapsed } = useSidebarStore();
const { streak, longestStreak } = useStreakStore();

  useEffect(() => {
    fetchStreakFromFirestore();
  }, []);
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-[10000]">
        <Sidebar />
      </div>

      {/* Main */}
      <div
        className={`flex flex-col bg-[#202020] flex-1 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 translate-y-[-1rem]">
          {/* Tabs */}
          <div className="flex justify-center gap-6 text-md font-medium mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize ${
                  activeTab === tab
                    ? "text-white underline underline-offset-4"
                    : "text-gray-400 hover:text-white hover:underline underline-offset-4"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="w-full mx-auto p-6 rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg min-h-[200px] text-white">
            {activeTab === "stats" && (
              <div className="flex flex-col items-center mb-6">
                <Flame size={80} color="orange" />
                <h2 className="text-2xl font-bold mt-2">Day {streak}</h2>
                <p className="text-gray-400 text-center max-w-xs mt-1">
                  Your current streak is on fire. Keep up the consistency!
                </p>
              </div>
            )}
            {activeTab === "habits" && <div>✅ Habits content</div>}
            {activeTab === "streak" && <div>🔥 Streak analytics</div>}
            {activeTab === "tasks" && <div>📋 Your tasks</div>}
            {activeTab === "achievements" && <div>🏆 Your achievements</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
