// components/SleepStreakCard.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getRandomSleepHours() {
  return parseFloat((Math.random() * 8).toFixed(1));
}

function getColorClass(hours: number) {
  if (hours < 2) return "bg-red-500";
  if (hours < 5) return "bg-yellow-500";
  return "bg-green-500";
}

function SleepStreakCard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [sleepData, setSleepData] = useState<Record<string, number>>({});

  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  useEffect(() => {
    const newSleepData: Record<string, number> = {};
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      newSleepData[key] = getRandomSleepHours();
    });
    setSleepData(newSleepData);
  }, [year, month]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Card className="backdrop-blur-md bg-black/30 border-none text-white h-full">
      <CardHeader>
        <CardTitle className="text-base mb-2">🔥 Sleep Streak</CardTitle>
        <div className="flex gap-4">
          <Select
            onValueChange={(val) => setYear(Number(val))}
            defaultValue={String(currentYear)}
          >
            <SelectTrigger className="w-32 text-white bg-black/30 border-none shadow-none">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(5)].map((_, i) => {
                const y = currentYear - i;
                return (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(val) => setMonth(Number(val))}
            defaultValue={String(currentMonth)}
          >
            <SelectTrigger className="w-40 text-white bg-black/30 border-none shadow-none">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
       <div className="grid grid-cols-7 gap-4 text-muted-foreground text-xs mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="w-8 text-center">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {[...Array(getDay(start))].map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8"></div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const sleepHours = sleepData[key];
            const color = getColorClass(sleepHours);

            return (
              <div
                key={key}
                className={`w-8 h-8 text-sm flex items-center justify-center rounded-md ${color} text-white`}
                title={`${sleepHours} hrs`}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>
        <p className="text-sm mt-4 text-muted-foreground text-center">
          Sleep data for {months[month]} {year}
        </p>
      </CardContent>
    </Card>
  );
}

export default SleepStreakCard;
