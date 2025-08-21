import React from 'react';
import type { Metadata } from 'next';
import '../app/globals.css'; // adjust path as needed
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

export const metadata: Metadata = {
  title: 'ExamConnect',
  description:
  "ExamConnect helps students conquer exams with balance. Stay productive with study planner, focus mode, habit tracker, and track progress with powerful analytics.",
  other: {
    'google-adsense-account': 'ca-pub-6676209672905473',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense script - loads once globally */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6676209672905473"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        
    
        {/* Main content should grow to fill available space */}
        <main className="flex-grow">
          {children}
        </main>
      <Analytics/>
      <SpeedInsights/>
      </body>
    </html>
  );
}
