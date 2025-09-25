// components/AdCashAd.tsx
"use client";

import { useEffect } from "react";

export default function AdCashAd({ zoneId }: { zoneId: string }) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).aclib) {
      (window as any).aclib.runAutoTag({ zoneId });
    }
  }, [zoneId]);

  return <div className="w-full h-32 my-2" />; // container for ad
}
