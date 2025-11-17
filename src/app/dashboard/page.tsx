"use client";

import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import AutoNotification from "@/components/AutoNotification";

export default function DashboardPage() {
return (
    <div className="flex min-h-screen">
      <AutoNotification />
      {/* Sidebar */}
      <div className="fixed sm:relative top-0 left-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* Main */}
      <div
        className={`flex flex-col  bg-[#202020] flex-1 transition-all duration-300 pl-0 sm:pl-0 `}
      >
        <div className="sticky top-0 z-10">
          <HeaderApp />
        </div>
        </div>
         </div>
  );
}