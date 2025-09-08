import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import React from "react";
import Sidebar from "@/components/Sidebar";

export default function Community() {
  return (
    <div className="flex min-h-screen  text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">
           PREMIUM PLANS COMING SOON !
          </h1>

        </div>
      </main>
    </div>
  );
}
