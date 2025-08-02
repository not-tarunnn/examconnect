"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import { Flame } from "lucide-react";

const TABS = ["stats", "habits", "streak", "tasks", "achievements"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("stats");

  return (
    <div className="flex min-h-screen text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area (Right of Sidebar) */}
      <main className="flex-1 flex flex-col overflow-y-auto px-6 pt-4">
        {/* Header (INSIDE main content) */}
        <div className="translate-y-[-0.9rem]">
          <HeaderApp />
        </div>

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
        <div className="w-full mx-auto p-6 rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg min-h-[200px]">
          {activeTab === "stats" && (
            <div className="flex flex-col items-center mb-6">
              <Flame size={80} color="orange" />
              <h2 className="text-2xl font-bold mt-2">Day 45</h2>
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
      </main>
    </div>
  );
}
