"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  targetDate: string; // "2026-02-05T18:00:00"
  name?: string;
};

export default function BirthdayExperience({ targetDate, name = "Anamika" }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setIsOpen(true);
        return;
      }

      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <>
      {/* ⏳ COUNTDOWN (Navbar Center) */}
      {!isOpen && timeLeft > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 text-xs md:text-sm font-medium text-white/80 tracking-wide pointer-events-none">
          Surprise in {formatTime(timeLeft)}
        </div>
      )}

      {/* 🎉 MODAL EXPERIENCE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Soft glow background */}
            <motion.div
              className="absolute w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative text-center max-w-xl"
            >
              <motion.h1
                className="text-4xl md:text-6xl font-semibold text-white tracking-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                Happy Birthday, {name} 🎂
              </motion.h1>

              <motion.p
                className="mt-6 text-white/70 text-base md:text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Wishing you a year filled with growth, joy, calm moments,
                and beautiful surprises.
              </motion.p>

              <motion.div
                className="mt-10 flex justify-center gap-6 text-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span>🎉</span>
                <span>✨</span>
                <span>💖</span>
              </motion.div>

              <motion.button
                onClick={() => setIsOpen(false)}
                className="mt-12 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm tracking-wide backdrop-blur-md border border-white/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
