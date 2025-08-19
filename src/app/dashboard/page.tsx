"use client";

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
            ⚠️Work In Progress! 
          </h1>
          <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
            
           
            🚀 Dashboard Launching soon.
           
          </p>
        </div>
      </main>
    </div>
  );
}
