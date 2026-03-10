"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import Footer from "@/components/community/FooterCom";
import PostFeed from "@/components/community/PostFeed";
import SuggestedGroups from "@/components/community/SuggestedGroups";
import CopyrightFooter from "@/components/community/CopyrightFooter";
import { useSidebarStore } from "@/store/useSidebarStore";
import AdSlot from "@/components/ads/AdSlot";

export default function CommunityPage() {
  const { collapsed } = useSidebarStore();

  return (
    <div className="flex min-h-screen bg-[#161616] text-white">
      {/* Sidebar - Overlay on mobile, fixed on desktop */}
      <div className="sm:fixed sm:top-0 sm:left-0 sm:h-screen sm:z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 w-full sm:w-auto ${
          collapsed ? "sm:ml-20" : "sm:ml-64"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20">
          <HeaderApp />
        </div>

        {/* Content Layout */}
        <main className="flex flex-col lg:flex-row flex-1 pt-2 sm:pt-4 px-2 sm:px-4 gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
          {/* Smaller left spacer */}
          <div className="hidden lg:block w-8 flex-shrink-0"></div>

          {/* Post Feed - Full width on mobile, max-w-3xl on desktop */}
          <div className="flex-1 min-w-0 w-full lg:max-w-3xl">
            <PostFeed />
          </div>

          {/* Popular Communities - Hidden on small screens, sidebar on large */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="translate-x-32 fixed">
              {/* Insert ad
        <AdSlot
          adClient="ca-pub-6676209672905473"
          adSlot="1204660986"
          adFormat="autorelaxed"
          style={{ display: "block" }}
        /> */}
            </div>
            <SuggestedGroups />
          </div>
        </main>

        {/* Copyright Footer */}
        <CopyrightFooter />

        {/* Footer - Now visible on all devices */}
        <Footer />
      </div>
    </div>
  );
}
