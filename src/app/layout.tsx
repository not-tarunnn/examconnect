import React from 'react';
import type { Metadata } from 'next';
import '../app/globals.css'; // adjust path as needed
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
import PresenceTracker from "@/components/PresenceTracker";

export const metadata: Metadata = {
  title: 'ExamConnect',
  description:
    "ExamConnect helps students conquer exams with balance. Stay productive with study planner, focus mode, habit tracker, and track progress with powerful analytics.",
  other: {
    'google-adsense-account': 'ca-pub-6676209672905473',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ExamConnect",
    "url": "https://examconnect.vercel.app", // update with your real domain
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "description": "ExamConnect helps students conquer exams with balance. Stay productive with study planner, focus mode, habit tracker, and track progress with powerful analytics,along with its powerful DBALA(Dynamic Biochemical Adaptive Learning Architecture).",
    "creator": {
      "@type": "Organization",
      "name": "ExamConnect Inc.",
      "url": "https://examconnect.vercel.app"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Google AdSense script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6676209672905473"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <PresenceTracker />
        <main className="flex-grow">{children}</main>

        {/* Vercel analytics */}
        <Analytics />
        <SpeedInsights />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </body>
    </html>
  );
}
