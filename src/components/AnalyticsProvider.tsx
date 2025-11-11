"use client";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Track pageview with GA4
    window.gtag?.("config", "G-RZMB0EDDN6", {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
