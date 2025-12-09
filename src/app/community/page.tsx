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
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20">
          <HeaderApp />
        </div>

        {/* Content Layout */}
        <main className="flex flex-1 pt-4 px-4 gap-6 max-w-7xl mx-auto w-full">
          {/* Smaller left spacer */}
          <div className="hidden lg:block w-8 flex-shrink-0"></div>

          {/* Post Feed - Bigger and closer to sidebar */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <PostFeed />
          </div>

          {/* Popular Communities - Closer to posts */}
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
