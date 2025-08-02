"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type SleepScoreCardProps = {
  sleepDuration: number; // in hours
};

export default function SleepScoreCard({ sleepDuration }: SleepScoreCardProps) {
  const sleepScore = Math.min(100, Math.floor((sleepDuration / 8) * 100));

  return (
    <Card className="bg-transparent h-64 backdrop-blur-md text-white border-none flex items-center justify-center">
      <CardHeader>
        <CardTitle className="text-9xl font-bold text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatedCounter value={sleepScore} />
          </motion.span>
        </CardTitle>
        <p className="text-muted-foreground text-sm text-center">
          Last night you slept {sleepDuration} hours
        </p>
      </CardHeader>
    </Card>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 2000; // total animation duration in ms
    const increment = end / (duration / 16); // ~60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}
