import React from 'react';
import type { Metadata } from 'next';
import '../app/globals.css'; // adjust path as needed
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
import PresenceTracker from "@/components/PresenceTracker";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import FCMRegistrar from '@/components/FCMRegistrar';

export const metadata: Metadata = {
  title: 'ExamConnect',
  description:
    "ExamConnect helps students conquer exams with balance. Stay productive with study planner, focus mode, habit tracker, and track progress with powerful analytics.",
  
   icons: {
    icon: [
      { url: "/icon_transparent.png", sizes: "48x48", type: "image/png" },
      { url: "/icon_transparent.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/icon_transparent.png",
  },
  
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
{process.env.NODE_ENV === "production" && (
  <>
    {/* Google Analytics scripts */}
    <Script
      strategy="afterInteractive"
      src="https://www.googletagmanager.com/gtag/js?id=G-RZMB0EDDN6"
    />
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RZMB0EDDN6', {
            page_path: window.location.pathname,
          });
        `,
      }}
    />
  </>
)}

        {/* Google AdSense script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6676209672905473"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
      </head>
      <body className="flex flex-col min-h-screen">
         <FCMRegistrar />
        <PresenceTracker />
         <AnalyticsProvider /> {/* ✅ Tracks route changes in SPA navigation */}
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
