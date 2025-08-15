"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSlotProps {
  adClient: string; // e.g. "ca-pub-6676209672905473"
  adSlot: string;   // e.g. "1204660986"
  adFormat?: string; // e.g. "autorelaxed", "auto", etc.
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdSlot({
  adClient,
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: "block" },
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    // Only run if this slot hasn't been initialized
    if (!initializedRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initializedRef.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, []);

  if (process.env.NODE_ENV !== "production") {
    // Show placeholder in dev mode to avoid policy issues
    return (
      <div
        style={{
          background: "#eee",
          padding: "10px",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        [AdSense Placeholder]
      </div>
    );
  }

  return (
    <ins
      key={`${adSlot}-${adClient}`} // ensures unique mount
      ref={adRef as any}
      className="adsbygoogle"
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
