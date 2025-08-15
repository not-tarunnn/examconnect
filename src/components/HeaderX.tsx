// components/HeaderX.tsx
'use client';

import Link from 'next/link';

export default function HeaderX() {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900">
          ExamConnect
        </Link>
        <nav className="space-x-6 text-sm font-medium text-gray-600">
          <Link href="/privacy" className="hover:text-blue-600 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-blue-600 transition">
            Terms of Use
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
