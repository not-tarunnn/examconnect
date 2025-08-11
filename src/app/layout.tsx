import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script'; // ✅ Import Script
import '../app/globals.css';

export const metadata: Metadata = {
  title: 'ExamConnect',
  description: 'Your all-in-one exam preparation community app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense Verification Script */}
        <meta name="google-adsense-account" content="ca-pub-6676209672905473"/>
      </head>
      <body className="flex flex-col min-h-screen">
        
        {/* Main content should grow to fill available space */}
        <main className="flex-grow">{children}</main>
       
      </body>
    </html>
  );
}
