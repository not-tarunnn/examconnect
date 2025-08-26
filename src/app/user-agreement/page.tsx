"use client";

import React from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowUp } from "lucide-react";

const EFFECTIVE_DATE = "August 27, 2025";
const VERSION = "1.0.0";

const sectionAnim = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export default function ReadOnlyUserAgreementPage() {
  function handleDownload() {
    const content = document.getElementById("agreement-content")?.innerText || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ExamConnect_UserAgreement_${VERSION}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">User Agreement</h1>
              <p className="text-sm text-muted-foreground mt-1">Exam Connect — Terms of Service</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">Version {VERSION}</Badge>
                <span className="text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleDownload}><Download className="h-4 w-4 mr-2"/>Download</Button>
              <Button variant="outline" onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        </motion.header>

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="rounded-2xl sticky top-20">
              <CardContent>
                <p className="text-sm font-medium mb-2">Contents</p>
                <nav className="text-sm space-y-2">
                  <a href="#agreement" className="block text-muted-foreground hover:text-foreground">1. Agreement</a>
                  <a href="#eligibility" className="block text-muted-foreground hover:text-foreground">2. Eligibility</a>
                  <a href="#accounts" className="block text-muted-foreground hover:text-foreground">3. Accounts</a>
                  <a href="#use" className="block text-muted-foreground hover:text-foreground">4. Use of Service</a>
                  <a href="#content" className="block text-muted-foreground hover:text-foreground">5. User Content</a>
                  <a href="#prohibited" className="block text-muted-foreground hover:text-foreground">6. Prohibited Conduct</a>
                  <a href="#privacy" className="block text-muted-foreground hover:text-foreground">7. Privacy</a>
                  <a href="#termination" className="block text-muted-foreground hover:text-foreground">8. Termination</a>
                  <a href="#liability" className="block text-muted-foreground hover:text-foreground">9. Liability</a>
                  <a href="#governing" className="block text-muted-foreground hover:text-foreground">10. Governing Law</a>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <article id="agreement-content" className="lg:col-span-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Exam Connect — User Agreement</CardTitle>
                <CardDescription className="mt-1">Read-only view of the full User Agreement. This page is styled to match Exam Connect’s legal pages.</CardDescription>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[70vh] pr-4">
                  <motion.section id="agreement" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
                    <motion.div variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>1. Agreement to Terms</h3>
                      <p>
                        These Terms of Service ("Agreement") govern your access to and use of the Exam Connect mobile and web applications, websites, and related services (collectively, the "Service"). By creating an account, accessing, or using the Service, you accept and agree to be bound by this Agreement. If you do not agree, do not use the Service.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="eligibility" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>2. Eligibility</h3>
                      <p>
                        You must be at least 13 years old to use the Service. If you are under 18, you may use the Service only with the involvement of a parent or guardian. By using the Service, you represent that you meet these eligibility requirements and have the right and authority to enter into this Agreement.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="accounts" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>3. Accounts</h3>
                      <p>
                        To access certain features, you may be required to create an account. You agree to provide accurate information and keep your credentials secure. You are responsible for activity that occurs under your account. If you learn of unauthorized use, contact us immediately at <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="use" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>4. Use of the Service</h3>
                      <p>
                        Exam Connect provides features such as study reminders, task management, social features (posts, likes, threads), analytics, sleep trackers, and productivity tools. The Service is for personal, non-commercial use unless otherwise agreed.
                      </p>
                      <p>
                        You agree not to misuse the Service, interfere with others' use, or attempt to access the Service by any automated means unless expressly permitted.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="content" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>5. User Content</h3>
                      <p>
                        You retain ownership of content you post ("User Content"). By posting, you grant Exam Connect a worldwide, royalty-free, transferable license to host, use, reproduce, modify, publish, and display your User Content to provide and improve the Service.
                      </p>
                      <p>
                        You are responsible for the User Content you upload. Do not post content that violates other people's rights or applicable law.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="prohibited" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>6. Prohibited Conduct</h3>
                      <ul>
                        <li>Impersonation, harassment, or stalking of others;</li>
                        <li>Uploading malware, spam, or deceptive content;</li>
                        <li>Using the Service for illegal activities;</li>
                        <li>Attempting to access other users’ accounts or data.</li>
                      </ul>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="privacy" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>7. Privacy</h3>
                      <p>
                        Our Privacy Policy explains how we collect and use your information. By using the Service you consent to our collection and use of data as outlined in the Privacy Policy. The Privacy Policy is available at <Link href="/privacy-policy">/privacy-policy</Link>.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="termination" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>8. Termination</h3>
                      <p>
                        We may suspend or terminate accounts that violate this Agreement or for operational reasons. Users may deactivate their accounts via the Account Settings page; account deletion requests will follow our data retention practices and applicable law.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="liability" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>9. Disclaimers & Limitation of Liability</h3>
                      <p>
                        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE". EXAM CONNECT DISCLAIMS ALL WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY LAW. EXAM CONNECT IS NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                      </p>
                      <p>
                        TO THE EXTENT PERMITTED BY LAW, THE TOTAL LIABILITY OF EXAM CONNECT FOR ANY CLAIM RELATED TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID, IF ANY, IN THE 12 MONTHS PRECEDING THE CLAIM.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="indemnity" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>10. Indemnification</h3>
                      <p>
                        You agree to indemnify and hold harmless Exam Connect and its officers, employees, and agents from claims arising out of your use of the Service or violation of this Agreement.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="governing" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>11. Governing Law & Disputes</h3>
                      <p>
                        This Agreement is governed by the laws of India without regard to conflict of law rules. Disputes will be resolved in courts located in India, unless otherwise agreed.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="changes" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>12. Changes to Terms</h3>
                      <p>
                        We may modify this Agreement. If changes are material, we will provide notice (by email or in-app) and seek consent when required. Continued use after changes constitutes acceptance of the updated terms.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="children" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>13. Children</h3>
                      <p>
                        The Service is not intended for children under 13. If you believe we have collected personal data of a child under 13, contact us at <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>.
                      </p>
                    </motion.div>

                    <Separator className="my-4" />

                    <motion.div id="contact" variants={sectionAnim} className="prose prose-sm max-w-none">
                      <h3>14. Contact</h3>
                      <p>
                        If you have questions about this Agreement, contact: helpexamconnect@gmail.com
                      </p>
                    </motion.div>

                    <div className="h-6" />
                  </motion.section>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp className="h-4 w-4 mr-2"/>Back to top</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="mt-6 text-xs text-muted-foreground">This is the same User Agreement text used in the acceptance flow. It is a template and not legal advice — consult counsel to tailor these terms for your business and jurisdiction.</p>
          </article>
        </main>
      </div>
    </div>
  );
}
