"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

const EFFECTIVE_DATE = "August 27, 2025";
const VERSION = "1.0.0";
const STORAGE_KEY = "examconnect_cookie_prefs";

type CookiePrefs = {
  preferences: boolean;
  analytics: boolean;
  advertising: boolean;
};

const DEFAULT_PREFS: CookiePrefs = {
  preferences: true,
  analytics: false,
  advertising: false,
};

export default function CookiePolicyPage() {
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_PREFS);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CookiePrefs & { savedAt?: string };
        setPrefs({
          preferences: !!parsed.preferences,
          analytics: !!parsed.analytics,
          advertising: !!parsed.advertising,
        });
        if (parsed.savedAt) setSavedAt(parsed.savedAt);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function savePrefs() {
    setLoading(true);
    try {
      const payload = {
        ...prefs,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(payload.savedAt);
      // NOTE: For production, also send consent to your analytics server / consent API.
      // e.g. fetch('/api/consent', ...) to register preferences server-side.
      setTimeout(() => setLoading(false), 400);
    } catch (e) {
      setLoading(false);
    }
  }

  function resetPrefs() {
    setPrefs(DEFAULT_PREFS);
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt(null);
  }

  function handleDownload() {
    const content = document.getElementById("policy-content")?.innerText || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ExamConnect_CookiePolicy_${VERSION}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Cookie Policy</h1>
              <p className="text-sm text-muted-foreground mt-1">How Exam Connect uses cookies and similar technologies</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">Version {VERSION}</Badge>
                <span className="text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button asChild>
                <Link href="/privacy-policy">View Privacy Policy</Link>
              </Button>
            </div>
          </div>
        </motion.header>

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="rounded-2xl sticky top-20">
              <CardContent>
                <p className="text-sm font-medium mb-2">Contents</p>
                <nav className="text-sm space-y-2">
                  <a href="#what" className="block text-muted-foreground hover:text-foreground">1. What are cookies?</a>
                  <a href="#types" className="block text-muted-foreground hover:text-foreground">2. Types of cookies</a>
                  <a href="#use" className="block text-muted-foreground hover:text-foreground">3. How we use cookies</a>
                  <a href="#third" className="block text-muted-foreground hover:text-foreground">4. Third‑party cookies</a>
                  <a href="#manage" className="block text-muted-foreground hover:text-foreground">5. Manage your cookies</a>
                  <a href="#disable" className="block text-muted-foreground hover:text-foreground">6. Disable cookies</a>
                  <a href="#retention" className="block text-muted-foreground hover:text-foreground">7. Data retention</a>
                  <a href="#contact" className="block text-muted-foreground hover:text-foreground">8. Contact</a>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <article id="policy-content" className="lg:col-span-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Exam Connect — Cookie Policy</CardTitle>
                <CardDescription className="mt-1">Short, clear explanation of cookies we use and how you can control them.</CardDescription>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <section id="what" className="prose prose-sm max-w-none">
                    <h3>1. What are cookies?</h3>
                    <p>
                      Cookies are small text files stored on your device by your browser. They help our site remember preferences, enable core functionality, and (when you opt in) allow us to measure and improve the product.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="types" className="prose prose-sm max-w-none">
                    <h3>2. Types of cookies we use</h3>
                    <ul>
                      <li><strong>Essential cookies</strong> — Required for the app to work (authentication, security, session). These are always active.</li>
                      <li><strong>Preference cookies</strong> — Store choices such as language, theme, and UI settings.</li>
                      <li><strong>Analytics cookies</strong> — Collect anonymous usage data to help us improve features and performance.</li>
                      <li><strong>Advertising cookies</strong> — Used only if you opt in; help deliver relevant marketing (we don’t serve third‑party ads by default).</li>
                    </ul>
                  </section>

                  <Separator className="my-4" />

                  <section id="use" className="prose prose-sm max-w-none">
                    <h3>3. How we use cookies</h3>
                    <p>
                      We use cookies to: keep you signed in, remember your preferences, measure how our features are used, and (with consent) personalise the content you see. Essential cookies are required for security and cannot be switched off.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="third" className="prose prose-sm max-w-none">
                    <h3>4. Third‑party cookies</h3>
                    <p>
                      We sometimes allow trusted third parties (analytics providers, payment processors) to set cookies on our site. These services are listed in our Privacy Policy and subject to their own terms.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="manage" className="prose prose-sm max-w-none">
                    <h3>5. Manage your cookies</h3>
                    <p>
                      Use the controls below to update your cookie preferences. Preferences are stored locally in your browser and (optionally) can be registered with our backend for cross‑device consistency.
                    </p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border p-3">
                        <p className="font-medium">Essential</p>
                        <p className="text-sm text-muted-foreground">Always active — required for authentication and security.</p>
                        <div className="mt-3 flex items-center justify-end">
                          <Switch checked={true} disabled />
                        </div>
                      </div>

                      <div className="rounded-xl border p-3">
                        <p className="font-medium">Preferences</p>
                        <p className="text-sm text-muted-foreground">Save language, theme and other settings.</p>
                        <div className="mt-3 flex items-center justify-end">
                          <Switch checked={prefs.preferences} onCheckedChange={(v) => setPrefs((s) => ({ ...s, preferences: Boolean(v) }))} />
                        </div>
                      </div>

                      <div className="rounded-xl border p-3">
                        <p className="font-medium">Analytics</p>
                        <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data.</p>
                        <div className="mt-3 flex items-center justify-end">
                          <Switch checked={prefs.analytics} onCheckedChange={(v) => setPrefs((s) => ({ ...s, analytics: Boolean(v) }))} />
                        </div>
                      </div>

                      <div className="rounded-xl border p-3">
                        <p className="font-medium">Advertising</p>
                        <p className="text-sm text-muted-foreground">Used only for personalised marketing if you opt in.</p>
                        <div className="mt-3 flex items-center justify-end">
                          <Switch checked={prefs.advertising} onCheckedChange={(v) => setPrefs((s) => ({ ...s, advertising: Boolean(v) }))} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Button variant="secondary" onClick={resetPrefs}>Reset</Button>
                      <Button onClick={savePrefs} disabled={loading}>{loading ? "Saving…" : "Save preferences"}</Button>
                      {savedAt && <div className="text-sm text-muted-foreground">Last saved: {new Date(savedAt).toLocaleString()}</div>}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">Note: Clearing your browser data will remove local cookie preferences. To persist preferences across devices, enable server-side consent recording (see developer notes).</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="disable" className="prose prose-sm max-w-none">
                    <h3>6. Disable cookies</h3>
                    <p>
                      You can disable cookies at the browser level — see your browser help for instructions. Disabling non-essential cookies may reduce functionality or personalization.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="retention" className="prose prose-sm max-w-none">
                    <h3>7. Data retention</h3>
                    <p>
                      Cookie lifetimes vary: session cookies expire when you close your browser; persistent cookies expire after a set time. Analytics cookies are typically retained for 26 months or less depending on the provider.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="contact" className="prose prose-sm max-w-none">
                    <h3>8. Contact</h3>
                    <p>
                      Questions about cookies or privacy: <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>
                    </p>
                  </section>

                  <div className="h-6" />
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="mt-6 text-xs text-muted-foreground">This cookie policy is a template to help you be transparent with users. It is not legal advice; consult counsel if you need jurisdiction-specific wording.</p>
          </article>
        </main>
      </div>
    </div>
  );
}
