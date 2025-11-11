"use client";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    window.gtag?.("config", "G-RZMB0EDDN6", {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
