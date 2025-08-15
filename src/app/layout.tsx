import React from 'react';
import type { Metadata } from 'next';
import '../app/globals.css'; // adjust path as needed
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
export const metadata: Metadata = {
  title: 'ExamConnect',
  description: 'Your all-in-one exam preparation community app',
  other: {
    'google-adsense-account': 'ca-pub-6676209672905473',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
