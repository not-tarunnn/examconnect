"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Flag, ShieldCheck, Download, Mail, AlertTriangle } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const EFFECTIVE_DATE = "August 27, 2025";
const VERSION = "1.0.0";

export default function ContentPolicyPage() {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ location: "", details: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submitReport() {
    if (!reportForm.location || !reportForm.details) return alert("Please provide what to report and why.");
    setSubmitting(true);
    try {
      // TODO: wire to Firestore / moderation inbox API
      await new Promise((r) => setTimeout(r, 700));
      setReportOpen(false);
      setReportForm({ location: "", details: "" });
      alert("Report submitted — (stub). Wire this to your moderation backend.");
    } catch (e) {
      console.error(e);
      alert("Could not submit report. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadPolicy() {
    const content = document.getElementById("policy-content")?.innerText || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ExamConnect_ContentPolicy_${VERSION}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-3"> 
                <FileText className="h-5 w-5" />
                Content Policy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Exam Connect — Community content rules & moderation</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">Version {VERSION}</Badge>
                <span className="text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={downloadPolicy}><Download className="h-4 w-4 mr-2"/>Download</Button>
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive"><Flag className="h-4 w-4 mr-2"/>Report content</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report content</DialogTitle>
                    <p className="text-sm text-muted-foreground">Paste a link or describe the post you want us to review.</p>
                  </DialogHeader>

                  <div className="space-y-3 mt-3">
                    <Input placeholder="Link or post ID (e.g. /posts/abc123)" value={reportForm.location} onChange={(e) => setReportForm((s) => ({ ...s, location: e.target.value }))} />
                    <Textarea placeholder="Why is this content problematic? (brief)" value={reportForm.details} onChange={(e) => setReportForm((s) => ({ ...s, details: e.target.value }))} />
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" onClick={() => setReportOpen(false)}>Cancel</Button>
                      <Button onClick={submitReport} disabled={submitting}>{submitting ? "Sending…" : "Submit report"}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.header>

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="rounded-2xl sticky top-20">
              <CardContent>
                <p className="text-sm font-medium mb-2">Contents</p>
                <nav className="text-sm space-y-2">
                  <a href="#scope" className="block text-muted-foreground hover:text-foreground">1. Scope</a>
                  <a href="#prohibited" className="block text-muted-foreground hover:text-foreground">2. Prohibited content</a>
                  <a href="#allowed" className="block text-muted-foreground hover:text-foreground">3. Allowed & contextual content</a>
                  <a href="#moderation" className="block text-muted-foreground hover:text-foreground">4. Moderation & enforcement</a>
                  <a href="#reporting" className="block text-muted-foreground hover:text-foreground">5. Reporting</a>
                  <a href="#copyright" className="block text-muted-foreground hover:text-foreground">6. Copyright</a>
                  <a href="#safety" className="block text-muted-foreground hover:text-foreground">7. Safety</a>
                  <a href="#changes" className="block text-muted-foreground hover:text-foreground">8. Changes</a>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <article id="policy-content" className="lg:col-span-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Exam Connect Content Policy</CardTitle>
                <CardDescription className="mt-1">Short, clear rules for what can and cannot appear on the platform.</CardDescription>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <section id="scope" className="prose prose-sm max-w-none">
                    <h3>1. Scope</h3>
                    <p>This Content Policy explains what user-created content is allowed on Exam Connect and how we respond when rules are broken. It applies to posts, comments, profiles, uploads, and any public messages on the Service.</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="prohibited" className="prose prose-sm max-w-none">
                    <h3>2. Prohibited content</h3>
                    <p>We remove content that falls into these categories:</p>
                    <ul>
                      <li><strong>Hate speech:</strong> Attacks or slurs targeting protected classes (race, religion, gender, sexual orientation, etc.).</li>
                      <li><strong>Harassment & threats:</strong> Targeted attacks, doxxing, stalking, or credible threats of violence.</li>
                      <li><strong>Sexual content involving minors:</strong> Any sexual content, images, or descriptions involving people under 18 — removed and reported.</li>
                      <li><strong>Graphic violence:</strong> Explicit depictions of gore or violence intended to shock or glorify harm.</li>
                      <li><strong>Illicit behavior & facilitating crime:</strong> Content that meaningfully facilitates wrongdoing (e.g., instructions for creating illegal weapons).</li>
                      <li><strong>Self-harm facilitation:</strong> Content that encourages or instructs suicide or self-harm. For urgent risk, contact local emergency services.</li>
                      <li><strong>Spam & scams:</strong> Fraudulent schemes, repeated unsolicited content, or deceptive links.</li>
                      <li><strong>False medical/financial claims:</strong> Dangerous health or investment advice presented as fact without evidence.</li>
                      <li><strong>Privacy violations & doxxing:</strong> Sharing private information without consent (addresses, ID numbers, private images).</li>
                    </ul>
                  </section>

                  <Separator className="my-4" />

                  <section id="allowed" className="prose prose-sm max-w-none">
                    <h3>3. Allowed & contextual content</h3>
                    <p>Content that might otherwise be sensitive may be allowed when contextualized for journalism, education, reporting, or artistic expression. Moderation considers intent, context, and audience.</p>
                    <p>Examples of allowed content include:</p>
                    <ul>
                      <li>Study notes or discussions about sensitive topics framed in an academic or support context.</li>
                      <li>News reporting that quotes problematic language for context.</li>
                      <li>Transformative or critical commentary.</li>
                    </ul>
                  </section>

                  <Separator className="my-4" />

                  <section id="moderation" className="prose prose-sm max-w-none">
                    <h3>4. Moderation & enforcement</h3>
                    <p>When content violates this policy we may:</p>
                    <ul>
                      <li>Remove or restrict the content.</li>
                      <li>Issue warnings or temporary suspensions.</li>
                      <li>Disable accounts for repeated or severe violations.</li>
                      <li>Escalate to law enforcement when required by law (e.g., credible threats, child sexual abuse).</li>
                    </ul>
                    <p>Moderation decisions balance safety, free expression, and proportionality. We aim to be consistent and may exercise discretion in edge cases.</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="reporting" className="prose prose-sm max-w-none">
                    <h3>5. Reporting</h3>
                    <p>If you see content that breaks these rules, please report it using the <em>Report content</em> button or email us.</p>
                    <p>When reporting, include:</p>
                    <ul>
                      <li>Link or screenshot of the content.</li>
                      <li>Short explanation of the issue.</li>
                      <li>Any relevant usernames or timestamps.</li>
                    </ul>
                    <p>We review reports as quickly as possible; response times vary depending on volume and severity.</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="copyright" className="prose prose-sm max-w-none">
                    <h3>6. Copyright</h3>
                    <p>If you believe your copyrighted work is posted without permission, send a takedown notice to <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a> with a descrição and proof of ownership. We will follow applicable copyright law and may remove or disable access to the material.</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="safety" className="prose prose-sm max-w-none">
                    <h3>7. Safety & minors</h3>
                    <p>Protecting minors is a priority. If you believe a minor is in danger, please report immediately and, where appropriate, contact local authorities. We will cooperate with law enforcement as required by law.</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="changes" className="prose prose-sm max-w-none">
                    <h3>8. Changes</h3>
                    <p>We may update this Content Policy. If changes are material, we’ll provide notice via email or in-app and indicate the new effective date. Continued use after changes indicates acceptance.</p>
                  </section>

                  <Separator className="my-4" />

                  <section id="contact" className="prose prose-sm max-w-none">
                    <h3>Contact</h3>
                    <p>Questions about this policy or moderation decisions: <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>.</p>
                  </section>

                  <div className="h-6" />
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>We aim for fair, transparent moderation.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</Button>
                    <Button onClick={() => { window.location.href = "mailto:helpexamconnect@gmail.com?subject=Content policy feedback"; }}>Feedback</Button>
                  </div>
                </div>

              </CardContent>
            </Card>

            <p className="mt-6 text-xs text-muted-foreground">This template is a starting point. It is not legal advice — consult legal counsel to adapt this policy to your product and jurisdiction.</p>
          </article>
        </main>
      </div>
    </div>
  );
}
