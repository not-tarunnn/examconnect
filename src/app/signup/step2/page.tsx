"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import clsx from "clsx";
import { motion } from "framer-motion";

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const classOptions = ["11", "12", "Undergrad", "Graduate"];
const examOptions = ["JEE", "NEET", "CUET", "UPSC-CSE", "Others"];

export default function Step2() {
  const router = useRouter();
  const { classLevel, targetExam, chronotype, avgSleepTime, setField } = useOnboardingStore();

  const handleNext = () => {
    router.push("/signup/step3");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header + progress */}
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Preferences & targets</h1>
              <p className="text-sm text-muted-foreground mt-1">Step 2 of 3 — academic & sleep preferences</p>
            </div>
            <div className="hidden sm:block text-sm text-muted-foreground">Onboarding</div>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-2/3 bg-primary/80" />
          </div>
        </motion.header>

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Tell us about your study context</CardTitle>
              <CardDescription>Choose your class, target exam, chronotype, and average sleep time.</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Class Selection */}
                <motion.div variants={fadeIn}>
                  <Label className="mb-2">Your Class</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {classOptions.map((cls) => (
                      <motion.div
                        key={cls}
                        onClick={() => setField("classLevel", cls)}
                        whileHover={{ translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={clsx(
                          "cursor-pointer rounded-xl p-4 text-center font-medium border transition-shadow",
                          classLevel === cls
                            ? "bg-primary/5 shadow-lg text-primary ring-2 ring-primary/20"
                            : "bg-background shadow-sm hover:shadow-md"
                        )}
                      >
                        {cls}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <Separator />

                {/* Exam Selection */}
                <motion.div variants={fadeIn}>
                  <Label className="mb-2">Target Exam</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {examOptions.map((exam) => (
                      <motion.div
                        key={exam}
                        onClick={() => setField("targetExam", exam)}
                        whileHover={{ translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={clsx(
                          "cursor-pointer rounded-xl p-4 text-center font-medium border transition-shadow uppercase",
                          targetExam === exam
                            ? "bg-primary/5 shadow-lg text-primary ring-2 ring-primary/20"
                            : "bg-background shadow-sm hover:shadow-md"
                        )}
                      >
                        {exam}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <Separator />

                {/* Chronotype Toggle */}
                <motion.div variants={fadeIn}>
                  <Label className="mb-2">Are you a...</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "morning", label: "Morning Eagle" },
                      { key: "night", label: "Night Owl" },
                    ].map((opt) => (
                      <motion.button
                        key={opt.key}
                        onClick={() => setField("chronotype", opt.key)}
                        whileHover={{ translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={clsx(
                          "w-full rounded-xl p-4 text-center font-medium transition-shadow border",
                          chronotype === opt.key
                            ? "bg-primary/5 shadow-lg text-primary ring-2 ring-primary/20"
                            : "bg-background shadow-sm hover:shadow-md"
                        )}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <Separator />

                {/* Sleep Input */}
                <motion.div variants={fadeIn}>
                  <Label htmlFor="sleep">Average Sleep Time (hours)</Label>
                  <div className="mt-2 w-40">
                    <Input
                      id="sleep"
                      type="number"
                      min={0}
                      max={24}
                      value={avgSleepTime ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setField("avgSleepTime", v === "" ? undefined : parseFloat(v));
                      }}
                      placeholder="e.g. 7.5"
                      className="text-black"
                    />
                  </div>
                </motion.div>

                <Separator />

                {/* Next Button */}
                <motion.div variants={fadeIn} className="flex justify-end pt-2">
                  <Button onClick={handleNext} className="rounded-full px-6">
                    Next →
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
