"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export default function SleepScoreCard() {
  const [user, setUser] = useState<User | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchSleepData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const todayDate = new Date().toISOString().split("T")[0];
        const q = query(
          collection(db, "sleepData"),
          where("uid", "==", user.uid),
          where("date", "==", todayDate),
          limit(1)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setDuration(data.duration || 0);
          setScore(data.score || 0);
        } else {
          setDuration(0);
          setScore(0);
        }
      } catch (error) {
        console.error("Error fetching sleep data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSleepData();
  }, [user]);

  if (loading) {
    return (
      <Card className="bg-transparent h-64 backdrop-blur-md text-white border-none flex items-center justify-center">
        <p>Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent h-64 backdrop-blur-md text-white border-none flex items-center justify-center">
      <CardHeader>
        <CardTitle className="text-9xl font-bold text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatedCounter value={score} />
          </motion.span>
        </CardTitle>
        <p className="text-muted-foreground text-sm text-center">
          Last night you slept {duration} hours
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

    const duration = 2000;
    const increment = end / (duration / 16);
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
