'use client';

import Image from "next/image";
import Link from 'next/link';
import Footer from '../components/Footer';
import TypingTitle from '@/components/TypingTitle'; // Update path if needed
import CardSwap, { Card } from '@/components/CardSwap';
import Galaxy from '@/components/Galaxy';
import { useEffect } from "react";
import useAuth from '@/hooks/useAuth';

export default function HomePage() {
    const { user, loading } = useAuth();

    useEffect(() => {
    document.body.style.backgroundColor = "#000000"; 
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const features = [
    {
      title: "Study & Sleep Tracker",
      description: "Track your study sessions and sleep patterns for optimized learning and rest.",
      icon: "📚",
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      title: "Task & Habit Management",
      description: "Create and organize tasks and habits with live progress syncing.",
      icon: "✓",
      gradient: "from-purple-600 to-pink-500"
    },
    {
      title: "Real-time Chat & Social Features",
      description: "Connect and collaborate with peers through chat, posts, and bookmarks.",
      icon: "💬",
      gradient: "from-green-600 to-emerald-500"
    },
    {
      title: "AI Tutor & Analytics Dashboard",
      description: "Get personalized tutoring and insights on your learning progress.",
      icon: "🤖",
      gradient: "from-orange-600 to-red-500"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Galaxy
          focal={[0.5, 0.5]}
          rotation={[1.0, 0.0]}
          starSpeed={0.5}
          density={1}
          hueShift={140}
          speed={1}
          mouseInteraction={true}
          glowIntensity={0.3}
          saturation={0}
          mouseRepulsion={true}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          transparent={true}
        />
      </div>

      <div className="absolute top-4 left-4 z-50">
        <Image src="/icon_transparent.png" alt="Logo" width={48} height={48} />
      </div>

      {/* Main content section */}
      <main className="flex flex-1 flex-col md:flex-row relative z-10 pointer-events-none">
        {/* LEFT: Text & Buttons Area */}
        <div className="text-white flex items-center justify-center p-10 w-full md:w-1/3 min-h-screen">
          <div className="flex flex-col w-full max-w-md space-y-12">
            {/* Headline + Tagline */}
            <div className="w-full space-y-6">
              {/* Unlock Potential Capsule */}
              <div className="inline-flex">
                <div className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20 transition">
                  <p className="text-xs font-medium text-white tracking-wide uppercase">
                    Unlock your potential
                  </p>
                </div>
              </div>

              {/* Main Heading */}
              <div className="min-h-[11.5rem]">
                <TypingTitle />
              </div>
            </div>

            {/* Buttons */}
            <div className={`flex gap-3 w-full ${user ? 'justify-center' : 'flex-col'}`}>
              {user ? (
                <Link href="/dashboard" passHref className="pointer-events-auto w-full">
                  <button className="w-full bg-white text-blue-600 font-semibold px-10 py-3 rounded-full hover:bg-gray-100 transition">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" passHref className="pointer-events-auto w-full">
                    <button className="w-full bg-white/10 backdrop-blur-lg border border-white/30 text-white px-10 py-3 rounded-full hover:bg-white/20 transition">
                      Log in
                    </button>
                  </Link>

                  <Link href="/signup" passHref className="pointer-events-auto w-full relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    </div>
                    <button className="w-full bg-white text-blue-600 font-semibold px-10 py-3 rounded-full hover:bg-gray-100 transition">
                      Sign up for free
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* University Login */}
            <p className="text-sm cursor-pointer hover:underline text-white font-semibold text-center self-center translate-x-[-1.5em] pointer-events-auto">
              University Login
            </p>
          </div>
        </div>

        {/* RIGHT: CardSwap Feature Cards Area */}
        <div className="relative w-full md:w-2/3 min-h-screen flex items-end justify-end p-10">
          <CardSwap width={580} height={360} delay={5000} pauseOnHover={true} cardDistance={60} verticalDistance={70} skewAmount={6} easing="elastic">
            {features.map((feature, idx) => (
              <Card key={idx} customClass="shadow-2xl hover:shadow-purple-500/50 transition-shadow duration-300 pointer-events-none">
                <div className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black pointer-events-none">
                  {/* Minimal Animated Icon Area */}
                  <div className={`relative w-full h-1/2 overflow-hidden flex-shrink-0 pointer-events-none bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                    <div className="text-6xl animate-bounce">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-col h-1/2 p-6 justify-between pointer-events-none">
                    <div className="space-y-3 pointer-events-none">
                      <h3 className="text-lg font-bold text-white leading-snug pointer-events-none">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed pointer-events-none">
                        {feature.description}
                      </p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors duration-300 self-start pointer-events-auto">
                      Learn More
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
