import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script'; // ✅ Import Script
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6676209672905473"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        {/* Main content should grow to fill available space */}
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
