'use client';

import Link from 'next/link';
import Footer from '../components/Footer';
import TypingTitle from '@/components/TypingTitle'; // Update path if needed
import { useEffect } from "react";
import useAuth from '@/hooks/useAuth';

export default function HomePage() {
    const { user, loading } = useAuth();

    useEffect(() => {
    document.body.style.backgroundColor = "#2e2448";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content section */}
      <main className="flex flex-1 flex-col md:flex-row">
        {/* LEFT: Animated Gradient Button Area */}
<div className="moving-gradient-whirlpool text-black flex items-center justify-center p-10 w-full md:w-1/3 min-h-screen rounded-lg">
  <div className="flex flex-col w-full max-w-md space-y-12">
    
    {/* Headline + Tagline */}
  <div className="w-full">
  {/* Fixed-height wrapper to reserve space for the heading */}
  <div className="min-h-[11.5rem]"> {/* Adjust height as needed */}
    <TypingTitle />
  </div>

  <p className="text-lg text-slate-950 mt-6 text-left">
    Unlock your potential — one click at a time.
  </p>
</div>

    {/* Centered Buttons */}
    <div className={`flex gap-4 w-full self-center ${user ? 'justify-center max-w-xs' : 'flex-row max-w-xs'}`}>
      {user ? (
        <Link href="/dashboard" passHref>
          <button className="bg-blue-600 text-white px-10 py-3 rounded-full hover:bg-blue-800 transition translate-x-[-12%]">
            Dashboard
          </button>
        </Link>
      ) : (
        <>
          <Link href="/login" passHref>
            <button className="w-full bg-blue-600 text-white px-10 py-3 rounded-full hover:bg-blue-800 transition">
              Log in
            </button>
          </Link>

          <Link href="/signup" passHref>
            <button className="w-full bg-blue-600 text-white px-5 py-3 rounded-full hover:bg-blue-800 transition">
              Sign up for free
            </button>
          </Link>
        </>
      )}
    </div>

    {/* Centered University Login */}
    <p className="text-sm cursor-pointer hover:underline text-black font-semibold text-center self-center translate-x-[-1.5em]">
      University Login
    </p>
  </div>
</div>

        {/* RIGHT: Text Prompt */}
        <div className="custom-gradient-right text-left flex flex-col justify-center p-10 text-purple-300 w-full md:w-2/3">
          
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
