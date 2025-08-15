"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, BarChart3, BellRing, Moon, MessageSquare, CheckSquare, Rocket, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// About Page for Exam Connect — white background, modern, production‑ready
// Tailwind + Framer Motion + shadcn/ui

const features = [
  {
    title: "AI Tutor",
    desc: "Get step‑by‑step help, instant answers, and smart suggestions tailored to your syllabus.",
    icon: Brain,
  },
  {
    title: "Analytics Dashboard",
    desc: "Understand study patterns, strengths, and gaps with clear insights and trends.",
    icon: BarChart3,
  },
  {
    title: "Smart Reminders",
    desc: "Stay on track with adaptive study plans, deadlines, and revision nudges.",
    icon: BellRing,
  },
  {
    title: "Sleep Tracker",
    desc: "Improve rest and focus with sleep logging, hygiene tips, and bedtime reminders.",
    icon: Moon,
  },
  {
    title: "Tasks & Habits",
    desc: "Plan tasks with subtasks and priorities; build daily habits and keep streaks alive.",
    icon: CheckSquare,
  },
  {
    title: "Real‑time Chat",
    desc: "Discuss doubts with friends and groups, with typing indicators and media sharing.",
    icon: MessageSquare,
  },
];

const values = [
  { title: "Focus", desc: "Minimal, distraction‑free design so you can study deeper." },
  { title: "Clarity", desc: "Data you can act on—no clutter, just what matters." },
  { title: "Care", desc: "Wellbeing features like sleep and breaks, not just grind." },
  { title: "Privacy", desc: "Your data, your control. We take security seriously." },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-neutral-900">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide uppercase bg-neutral-50">About Exam Connect</span>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Study smarter. Sleep better. <span className="text-neutral-500">Grow consistently.</span>
            </h1>
            <p className="text-neutral-600 text-lg leading-relaxed">
              Exam Connect is your all‑in‑one companion for school and competitive prep. We blend
              AI tutoring with task planning, analytics, sleep hygiene, and community so you can
              learn better—without burning out.
            </p>
            <div className="flex gap-3">
              <Button asChild className="rounded-2xl px-5 py-5">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl px-5 py-5">
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-neutral-500">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Secure by design</div>
              <div className="flex items-center gap-2"><Rocket className="h-4 w-4" /> Fast & responsive</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-3xl shadow-xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 md:p-10 border">
              <div className="grid grid-cols-2 gap-4">
                {features.slice(0, 4).map((f, i) => (
                  <Card key={f.title} className="rounded-2xl border-neutral-200">
                    <CardContent className="p-4">
                      <f.icon className="h-6 w-6" />
                      <div className="mt-3 font-medium">{f.title}</div>
                      <div className="text-sm text-neutral-600">{f.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="absolute -bottom-6 -right-6 hidden md:block">
                <div className="rounded-3xl border bg-white p-4 shadow-lg w-52">
                  <div className="text-sm font-medium">Daily Progress</div>
                  <div className="mt-2 h-2 w-full rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full bg-neutral-900" style={{ width: "72%" }} />
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">72% of today’s plan done</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-2xl h-full border-neutral-200">
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-2xl border flex items-center justify-center">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="text-neutral-600 text-sm mt-1">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Our Mission</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              We built Exam Connect to make consistent progress feel simple. Students deserve tools
              that combine planning, insights, and wellbeing with the power of AI—so every study
              session is purposeful and sustainable.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-2xl border p-4">
                  <div className="font-medium">{v.title}</div>
                  <div className="text-sm text-neutral-600 mt-1">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border p-5">
              <div className="text-sm text-neutral-500">Why students choose us</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700 list-disc pl-5">
                <li>Fast onboarding with Google/Apple/Email and secure auth</li>
                <li>Tasks with subtasks, priorities, filters, and real‑time updates</li>
                <li>Sleep tools and reminders to protect focus and memory</li>
                <li>Clean UI, keyboard‑friendly, works great on mobile and desktop</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-5">
              <div className="text-sm text-neutral-500">Security & Privacy</div>
              <p className="mt-2 text-sm text-neutral-700">
                We follow industry best practices for authentication and data storage. You control
                your data and can delete your account anytime from settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl border bg-neutral-50 p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">Ready to make steady progress?</h3>
          <p className="mt-3 text-neutral-600 max-w-2xl mx-auto">
            Join thousands of learners building consistent study habits with Exam Connect.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild className="rounded-2xl px-6 py-5">
              <Link href="/signup">Create your account</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl px-6 py-5">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
