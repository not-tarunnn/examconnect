"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Send, MessageSquare, ShieldCheck, Clock, MapPin, Github, Twitter, HeartHandshake, Bug, Sparkles, CreditCard, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Menu, X, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContactPage() {
  const supportEmail = "helpexamconnect@gmail.com";

  const topics = useMemo(
    () => [
      { value: "account", label: "Account & Login", icon: <HeartHandshake className="h-4 w-4" /> },
      { value: "bug", label: "Bug report", icon: <Bug className="h-4 w-4" /> },
      { value: "feature", label: "Feature request", icon: <Sparkles className="h-4 w-4" /> },
      { value: "billing", label: "Billing / Subscriptions", icon: <CreditCard className="h-4 w-4" /> },
      { value: "general", label: "General", icon: <Info className="h-4 w-4" /> },
    ],
    []
  );

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "error">(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerQuery, setHeaderQuery] = useState("");

  function validate() {
    const e: { [k: string]: string } = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 12)
      e.message = "Please add at least 12 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSent(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Optional: If you have an API route at /api/contact, this will post there.
      // Otherwise, we'll gracefully fallback to opening the user's mail client.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, page: "contact" }),
      });
      if (res.ok) {
        setSent("ok");
        setForm({ name: "", email: "", topic: "general", message: "" });
      } else {
        // Fallback to mailto if API not present or returns error
        const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(
          `[${form.topic.toUpperCase()}] from ${form.name}`
        )}&body=${encodeURIComponent(form.message + `\n\nMy email: ${form.email}`)}`;
        window.location.href = mailto;
        setSent("ok");
      }
    } catch (err) {
      const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(
        `[${form.topic.toUpperCase()}] from ${form.name}`
      )}&body=${encodeURIComponent(form.message + `\n\nMy email: ${form.email}`)}`;
      window.location.href = mailto;
      setSent("ok");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
    {/* Header */}
<header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
  <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
    {/* brand */}
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center">
        <ShieldCheck className="h-5 w-5 text-white" />
      </div>
      <div>
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          ExamConnect
        </Link>
        <p className="text-xs text-gray-500">Student-first study tools</p>
      </div>
    </div>

    {/* desktop nav + search + contact */}
    <div className="hidden md:flex items-center gap-4">
      <nav className="flex items-center gap-2">
        <Link
          href="/contact"
          className="text-sm font-medium px-3 py-2 rounded-md bg-gradient-to-tr from-pink-50 to-yellow-50"
          aria-current="page"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
            Contact
          </span>
        </Link>

        <Link
          href="/terms-and-conditions"
          className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
        >
          Terms &amp; Conditions
        </Link>

        <Link
          href="/privacy-policy"
          className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
        >
          Privacy Policy
        </Link>
      </nav>

      {/* search (non-critical, theme-consistent) */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={headerQuery}
          onChange={(e) => setHeaderQuery(e.target.value)}
          placeholder="Search site…"
          className="pl-8 w-56 bg-white"
          aria-label="Search site"
        />
      </div>

      {/* quick email CTA */}
      <a
        href={`mailto:${supportEmail}`}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 border text-sm text-gray-700 hover:bg-gray-50"
      >
        <Mail className="h-4 w-4" />
        Email
      </a>
    </div>

    {/* mobile toggle */}
    <div className="md:hidden flex items-center">
      <button
        onClick={() => setMobileOpen((s) => !s)}
        aria-expanded={mobileOpen}
        aria-label="Toggle menu"
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        {mobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </button>
    </div>
  </div>

  {/* mobile panel */}
  {mobileOpen && (
    <div className="md:hidden border-t bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-col gap-2">
          <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-gray-900 font-medium rounded-md px-3 py-2">
            Contact
          </Link>
          <Link href="/terms-and-conditions" onClick={() => setMobileOpen(false)} className="block text-gray-700 rounded-md px-3 py-2">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy-policy" onClick={() => setMobileOpen(false)} className="block text-gray-700 rounded-md px-3 py-2">
            Privacy Policy
          </Link>

          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                placeholder="Search site…"
                className="pl-10 w-full bg-white"
                aria-label="Search site"
              />
            </div>
            <a
              href={`mailto:${supportEmail}`}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 border text-sm text-gray-700"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )}
</header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-b from-gray-100 to-white blur-2xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-gradient-to-t from-gray-100 to-white blur-2xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-20 sm:pb-14">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600 bg-white/70 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              We read every message
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Contact ExamConnect
              </span>
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-gray-600">
              Questions, feedback, or ideas? We’d love to hear from you.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 text-sm text-gray-700">
              <Mail className="h-4 w-4" />
              <a className="font-medium underline underline-offset-4 hover:no-underline" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: contact form */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="lg:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your name</Label>
                      <Input
                        id="name"
                        placeholder="Ada Lovelace"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        required
                        aria-invalid={!!errors.name}
                        aria-describedby="name-error"
                      />
                      {errors.name && (
                        <p id="name-error" className="text-xs text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        required
                        aria-invalid={!!errors.email}
                        aria-describedby="email-error"
                      />
                      {errors.email && (
                        <p id="email-error" className="text-xs text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Select
                        value={form.topic}
                        onValueChange={(v) => setForm((s) => ({ ...s, topic: v }))}
                      >
                        <SelectTrigger id="topic" className="bg-white">
                          <SelectValue placeholder="Choose a topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {topics.map((t) => (
                            <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                {t.icon}
                                <span>{t.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject (optional)</Label>
                      <Input
                        id="subject"
                        placeholder="Quick question about..."
                        onChange={(e) => {
                          // not stored; we’ll blend into message for mailto
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us a bit more about what you need help with…"
                      value={form.message}
                      onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                      className="min-h-[140px]"
                      required
                      aria-invalid={!!errors.message}
                      aria-describedby="message-error"
                    />
                    {errors.message && (
                      <p id="message-error" className="text-xs text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Honeypot */}
                  <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button type="submit" disabled={loading} className="inline-flex gap-2">
                      <Send className="h-4 w-4" />
                      {loading ? "Sending…" : "Send message"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <a
                        href={`mailto:${supportEmail}?subject=${encodeURIComponent("Support request from ExamConnect site")}`}
                      >
                        <Mail className="mr-2 h-4 w-4" /> Email directly
                      </a>
                    </Button>
                    {sent === "ok" && (
                      <span className="text-sm text-green-600" role="status" aria-live="polite">
                        Thanks! We’ll be in touch.
                      </span>
                    )}
                    {sent === "error" && (
                      <span className="text-sm text-red-600" role="status" aria-live="polite">
                        Something went wrong. Please try again or email us.
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: quick contact + info */}
          <motion.aside initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.05 }} className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Quick contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border p-2 bg-white">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${supportEmail}`} className="text-sm font-medium underline underline-offset-4">
                      {supportEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border p-2 bg-white">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Support hours</p>
                    <p className="text-sm font-medium">We aim to reply promptly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border p-2 bg-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium">Online – global support</p>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center gap-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`mailto:${supportEmail}`}>Email us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Popular topics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {topics.map((t) => (
                  <div key={t.value} className="group rounded-2xl border p-3 hover:shadow-sm transition">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {t.icon}
                      {t.label}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Ask about {t.label.toLowerCase()}.</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Stay connected</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild aria-label="GitHub">
                  <Link href="#">
                    <Github className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" asChild aria-label="Twitter / X">
                  <Link href="#">
                    <Twitter className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.aside>
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.05 }} className="mt-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold">Frequently asked</h2>
            <div className="mt-4 divide-y rounded-2xl border">
              <details className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium">How soon will I get a reply?</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-2 text-sm text-gray-600">
                  We read every message and respond as quickly as possible. If your request is urgent, email us directly at {" "}
                  <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
                </p>
              </details>
              <details className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium">What should I include in a bug report?</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-2 text-sm text-gray-600">
                  Describe what you expected, what happened instead, and steps to reproduce. Screenshots and your device/browser info help a lot.
                </p>
              </details>
              <details className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium">Do you support feature suggestions?</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-2 text-sm text-gray-600">
                  Absolutely—share your idea and how it would help your studies. We prioritize the most impactful requests.
                </p>
              </details>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer strip */}
      <footer className="border-t bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} ExamConnect</p>
          <div className="mt-3 sm:mt-0 text-sm text-gray-600">
            Prefer email? <a href={`mailto:${supportEmail}`} className="font-medium underline">{supportEmail}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
