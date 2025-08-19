"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, FileText, Mail, Search, Copy, CheckCircle2, ExternalLink, Printer, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";

// ✅ Update these constants for your org
const APP_NAME = "Exam Connect";
const CONTACT_EMAIL = "helpexamconnect@gmail.com";
const LAST_UPDATED = "August 19, 2025"; // keep this fresh

// Anchored sections for the sidebar
const sections = [
  { id: "intro", label: "Overview" },
  { id: "data-we-collect", label: "Data We Collect" },
  { id: "how-we-use", label: "How We Use Data" },
  { id: "lawful-bases", label: "Lawful Bases" },
  { id: "sharing", label: "Sharing & Processors" },
  { id: "retention", label: "Data Retention" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your Rights" },
  { id: "cookies", label: "Cookies & Similar Tech" },
  { id: "children", label: "Children's Privacy" },
  { id: "intl", label: "International Transfers" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter((s) => s.label.toLowerCase().includes(q));
  }, [query]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-gray-800">
      {/* Header (replace your existing header block with this) */}
<div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
  <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
    {/* logo + title */}
    <div className="flex items-center gap-3">
      <div className="size-9 rounded-2xl bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center">
        <Shield className="size-5 text-white" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-gray-500">for {APP_NAME} • Last updated {LAST_UPDATED}</p>
      </div>
    </div>

    {/* Desktop nav + search + actions */}
    <div className="hidden md:flex items-center gap-4">
      {/* nav links */}
      <nav className="flex items-center gap-2">
        <Link
          href="/contact"
          className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
        >
          Contact
        </Link>

        <Link
          href="/terms-and-conditions"
          className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
        >
          Terms &amp; Conditions
        </Link>

        {/* Active page gets a subtle pill + gradient text accent to match theme */}
        <Link
          href="/privacy-policy"
          className="text-sm font-medium px-3 py-2 rounded-md bg-gradient-to-tr from-pink-50 to-yellow-50"
          aria-current="page"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
            Privacy Policy
          </span>
        </Link>
      </nav>

      {/* search (hidden on very small screens) */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sections…"
          className="pl-8 w-56"
          aria-label="Search policy sections"
        />
      </div>

      {/* print button */}
      <Button variant="outline" onClick={printPage} className="gap-2">
        <Printer className="size-4" /> Print
      </Button>
    </div>

    {/* Mobile: menu button */}
    <div className="md:hidden flex items-center gap-2">
      <button
        onClick={() => setMobileOpen((s) => !s)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        {mobileOpen ? <X className="size-5 text-gray-700" /> : <Menu className="size-5 text-gray-700" />}
      </button>
    </div>
  </div>

  {/* Mobile menu panel */}
  {mobileOpen && (
    <div className="md:hidden border-t bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-col gap-2">
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="block text-gray-700 rounded-md px-3 py-2 hover:bg-gray-50"
          >
            Contact
          </Link>

          <Link
            href="/terms-and-conditions"
            onClick={() => setMobileOpen(false)}
            className="block text-gray-700 rounded-md px-3 py-2 hover:bg-gray-50"
          >
            Terms &amp; Conditions
          </Link>

          <Link
            href="/privacy-policy"
            onClick={() => setMobileOpen(false)}
            className="block text-gray-900 font-medium rounded-md px-3 py-2 bg-gradient-to-tr from-pink-50 to-yellow-50"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
              Privacy Policy
            </span>
          </Link>

          {/* mobile search + print */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections…"
                className="pl-10 w-full"
                aria-label="Search policy sections"
              />
            </div>
            <Button variant="outline" onClick={printPage} className="gap-2 whitespace-nowrap">
              <Printer className="size-4" /> Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

      {/* Body */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">On this page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {filteredSections.map((s) => (
                <Link key={s.id} href={`#${s.id}`} className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  <span>{s.label}</span>
                  <ChevronRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="mt-4 hidden lg:block">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="#contact">Request my data</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="#contact">Delete my account</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Content */}
        <section className="space-y-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full">Transparent by design</Badge>
                  <Badge variant="secondary" className="rounded-full">Student-first</Badge>
                  <Badge variant="outline" className="rounded-full">No spam</Badge>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  This Privacy Policy explains how {APP_NAME} ("we", "us", or "our") collects, uses, shares, and protects your personal information when you use our website, mobile or web apps, and related services (collectively, the "Service"). By using the Service, you agree to the practices described below.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Intro */}
          <div id="intro" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
            <p className="text-gray-600">
              We keep data collection minimal and purposeful — to operate core features like authentication, your study tools (tasks, Pomodoro, sleep tracker), and social/community features in beta. We do not sell your personal information.
            </p>
          </div>

          {/* Data We Collect */}
          <div id="data-we-collect" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Data We Collect</h2>
            <p className="text-gray-600">We collect the following information when you use {APP_NAME}:</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Account & Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Identifiers: email, username, UID (from Firebase Auth); password (hashed by Firebase, never stored by us).</li>
                    <li>Profile: name, bio, gender, date of birth, profile photo.</li>
                    <li>Academic info: class/stream, JEE/NEET selection (if provided).</li>
                    <li>Social logins: Google, Facebook, Apple (only tokens/IDs needed for login).</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">App Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tasks & habits (including subtasks and completion status).</li>
                    <li>Pomodoro sessions and streaks.</li>
                    <li>Sleep tracker inputs and reminders.</li>
                    <li>Community interactions (posts, likes, bookmarks, comments) in beta.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Device & Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Log data: IP address, timestamps, app version, device/browser type.</li>
                    <li>Approximate location (derived from IP) to secure accounts and detect abuse.</li>
                    <li>Crash/diagnostic reports to improve stability.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cookies & Local Storage</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  We use essential cookies/local storage to keep you signed in, remember preferences, and protect your account. Optional analytics cookies are used only with your consent (if enabled).
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="examples">
                <AccordionTrigger className="text-sm font-medium">Examples of data fields</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b bg-gray-50 text-gray-600">
                        <tr>
                          <th className="p-2">Category</th>
                          <th className="p-2">Examples</th>
                          <th className="p-2">Purpose</th>
                          <th className="p-2">Retention</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-2">Account</td>
                          <td className="p-2">Email, UID, username</td>
                          <td className="p-2">Login & security</td>
                          <td className="p-2">While account is active</td>
                        </tr>
                        <tr>
                          <td className="p-2">Profile</td>
                          <td className="p-2">Name, photo, bio</td>
                          <td className="p-2">Personalization</td>
                          <td className="p-2">Until you delete or update</td>
                        </tr>
                        <tr>
                          <td className="p-2">Activity</td>
                          <td className="p-2">Tasks, streaks, posts</td>
                          <td className="p-2">Core features</td>
                          <td className="p-2">Until deleted or account removal</td>
                        </tr>
                        <tr>
                          <td className="p-2">Diagnostics</td>
                          <td className="p-2">Crash & performance logs</td>
                          <td className="p-2">Improve reliability</td>
                          <td className="p-2">Short-term aggregated</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* How We Use Data */}
          <div id="how-we-use" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Authenticate you and secure your account.</li>
              <li>Provide and improve study tools (tasks, Pomodoro, sleep, reminders) and social features.</li>
              <li>Sync your data across devices and keep real-time updates.</li>
              <li>Prevent fraud, abuse, and violations of our Terms.</li>
              <li>Communicate service updates, security alerts, and feature announcements.</li>
              <li>With consent (if enabled), analyze usage to improve usability and performance.</li>
            </ul>
          </div>

          {/* Lawful Bases */}
          <div id="lawful-bases" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Legal/Lawful Bases</h2>
            <p className="text-gray-600">
              Depending on your location, we process personal data under one or more of the following bases:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><span className="font-medium">Consent</span> — e.g., optional analytics or certain notifications.</li>
              <li><span className="font-medium">Contract</span> — to provide the Service you sign up for.</li>
              <li><span className="font-medium">Legitimate interests</span> — e.g., to keep our Service safe and useful, without overriding your rights.</li>
              <li><span className="font-medium">Legal obligation</span> — when we must comply with law or valid requests.</li>
            </ul>
          </div>

          {/* Sharing */}
          <div id="sharing" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Sharing & Service Providers</h2>
            <p className="text-gray-600">We do not sell your personal information. We share limited data with service providers who help us run {APP_NAME}:</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Firebase (Google)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-1">
                  <p>Authentication, Firestore database, Realtime Database (chat), storage, and security.</p>
                  <p>Data handled: identifiers, profile, app activity, device logs.</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Social Login Providers</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-1">
                  <p>Google, Facebook, Apple — used only for authentication and account linking.</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Analytics (optional)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-1">
                  <p>We may use privacy-friendly analytics or Firebase Analytics with consent where required. You can opt out in settings if available.</p>
                </CardContent>
              </Card>
            </div>

            <p className="text-xs text-gray-500">We may also share data if legally required, to protect users, or in connection with a merger, acquisition, or asset sale.</p>
          </div>

          {/* Retention */}
          <div id="retention" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Data Retention</h2>
            <p className="text-gray-600">
              We keep your personal data only as long as needed for the purposes described above. Most content is stored while your account is active. You can delete content (like tasks) at any time; backups may persist for a limited period.
            </p>
          </div>

          {/* Security */}
          <div id="security" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Security</h2>
            <p className="text-gray-600">
              We use modern security controls including secure authentication, encrypted transport (HTTPS), server-side security rules, and access controls. No system can be 100% secure, but we work to protect your information continuously.
            </p>
          </div>

          {/* Rights */}
          <div id="rights" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Your Privacy Choices & Rights</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="india">
                <AccordionTrigger className="text-sm font-medium">India (DPDP Act, 2023)</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
                    <li>Access: Ask for a copy of your personal data we process.</li>
                    <li>Correction: Request corrections to inaccurate data.</li>
                    <li>Erasure: Request deletion of your data, subject to legal exceptions.</li>
                    <li>Consent management & withdrawal (where processing is based on consent).</li>
                    <li>Grievance redressal: Contact us via the email below.</li>
                    <li>Nominate: Appoint someone to exercise rights on your behalf where applicable.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="gdpr">
                <AccordionTrigger className="text-sm font-medium">EEA/UK (GDPR)</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
                    <li>Rights include access, rectification, erasure, restriction, portability, and objection.</li>
                    <li>Where processing is based on consent, you can withdraw it at any time.</li>
                    <li>You may lodge a complaint with your local supervisory authority.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ccpa">
                <AccordionTrigger className="text-sm font-medium">California (CCPA/CPRA)</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
                    <li>Rights to know, correct, delete, and opt-out of certain sharing.</li>
                    <li>We do not sell personal information as defined by CCPA.</li>
                    <li>Non-discrimination for exercising your rights.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Cookies */}
          <div id="cookies" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Cookies & Similar Technologies</h2>
            <p className="text-gray-600">
              Essential cookies/local storage keep you logged in and secure the app. Optional analytics cookies are only used with consent (where required). You can control cookies in your browser settings; disabling essential cookies may break the app.
            </p>
          </div>

          {/* Children */}
          <div id="children" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Children's Privacy</h2>
            <p className="text-gray-600">
              {APP_NAME} is designed for students, but not for children under 13. If you believe a child under 13 used the Service without appropriate consent, contact us to remove their data.
            </p>
          </div>

          {/* International */}
          <div id="intl" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">International Data Transfers</h2>
            <p className="text-gray-600">
              We may process and store data in countries other than your own (for example, with our cloud providers). Where required, we use appropriate safeguards for cross-border transfers.
            </p>
          </div>

          {/* Changes */}
          <div id="changes" className="scroll-mt-24 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Policy to reflect changes in our practices or the law. We will update the date above and, when appropriate, notify you within the app or by email.
            </p>
          </div>

          {/* Contact */}
          <div id="contact" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Contact Us</h2>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <Badge variant="secondary" className="rounded-full">Privacy & Grievance</Badge>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <Mail className="size-4" />
                    <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">{CONTACT_EMAIL}</a>
                    <Button size="icon" variant="ghost" onClick={handleCopy} aria-label="Copy email">
                      {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  For data access/deletion requests, please include the email/username associated with your account. We aim to respond within 30 days.
                </p>
              </CardContent>
            </Card>
            
          </div>
        </section>
      </main>

      {/* Footer mini note */}
      <footer className="mx-auto max-w-6xl px-4 pb-16 pt-4 text-xs text-gray-500">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
