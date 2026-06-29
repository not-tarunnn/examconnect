"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { generateOnboardingTasks } from "@/lib/generateOnboardingTasks";
import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const EFFECTIVE_DATE = "August 27, 2025";
const VERSION = "1.0.0";

export default function Step3() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [wantsNewsletter, setWantsNewsletter] = useState(false);
  useEffect(() => {
    // Optionally hydrate acceptance state from server/user metadata
    // TODO: fetch user acceptance record from Firestore: users/{uid}/agreements/userAgreement
  }, [user]);

  function handleDownload() {
    // Create a simple downloadable text/PDF stub. For production, generate server-side PDF.
    const content = document.getElementById("terms-content")?.innerText || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ExamConnect_UserAgreement_${VERSION}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const router = useRouter();
  const {
    agreed,
    username,
    fullName,
    gender,
    dob,
    bio,
    profilePic,
    classLevel,
    targetExam,
    setField,
  } = useOnboardingStore();

  const handleSubmit = async () => {
    if (!agreed) {
      return alert("Please check the box to agree to the User Agreement.");
    }

    setSaving(true);
    try {
      const userObj = auth.currentUser;
      if (!userObj) return alert("User not authenticated");

      const uid = getAuth().currentUser?.uid;
      if (!uid) {
        throw new Error("User is not authenticated");
      }

      const finalProfilePic = profilePic || userObj.photoURL || "";

      // Save main user document
      await setDoc(doc(db, "users", uid), {
        username,
        fullName,
        email: userObj.email || "",
        gender,
        dob,
        bio,
        profilePic: finalProfilePic,
        classLevel,
        targetExam,
        agreed,
        createdAt: serverTimestamp(),
      });

      // Store the username separately to ensure uniqueness
      await setDoc(doc(db, "usernames", username), { uid, email: userObj.email || "" });

      // Record agreement metadata (subcollection under user)
      await setDoc(doc(db, "users", uid, "agreements", "userAgreement"), {
        version: VERSION,
        acceptedAt: serverTimestamp(),
      });

      // Record newsletter preference (optional)
      await setDoc(doc(db, "users", uid, "agreements", "newsletterOptIn"), {
        optedIn: wantsNewsletter || false,
        updatedAt: serverTimestamp(),
      });

      // Generate and save onboarding study tasks based on class and exam
      const onboardingTasks = generateOnboardingTasks(uid, classLevel, targetExam);
      const tasksCollection = collection(db, "tasks");
      for (const taskData of onboardingTasks) {
        await addDoc(tasksCollection, taskData);
      }

      // set local acceptedAt for UI
      setAcceptedAt(new Date().toISOString());

      // Navigate to dashboard
      router.push("/task");
    } catch (e) {
      console.error(e);
      alert("Could not complete onboarding. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header + progress (consistent with step 1/2) */}
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">User Agreement</h1>
              <p className="text-sm text-muted-foreground mt-1">Step 3 of 3 — review & accept</p>

              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">Version {VERSION}</Badge>
                <span className="text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</span>
                {acceptedAt && (
                  <span className="text-sm text-success">Accepted: {new Date(acceptedAt).toLocaleString()}</span>
                )}
              </div>
            </div>

         <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
  <Button asChild>
    <Link href="/privacy-policy">View Privacy Policy</Link>
  </Button>
  <Button variant="ghost" onClick={handleDownload}>
    <Download className="h-4 w-4 mr-2" />
    Download
  </Button>
</div>

          </div>

          {/* Progress bar: step 3 = full */}
          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-full bg-primary/80 transition-all" />
          </div>
        </motion.header>

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* TOC */}
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

          <article id="terms-content" className="lg:col-span-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Exam Connect — User Agreement</CardTitle>
                <CardDescription className="mt-1">Please read carefully. By using Exam Connect, you agree to these terms.</CardDescription>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <section id="agreement" className="prose prose-sm max-w-none">
                    <h3>1. Agreement to Terms</h3>
                    <p>
                      These Terms of Service ("Agreement") govern your access to and use of the Exam Connect mobile and web applications, websites, and related services (collectively, the "Service"). By creating an account, accessing, or using the Service, you accept and agree to be bound by this Agreement. If you do not agree, do not use the Service.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="eligibility" className="prose prose-sm max-w-none">
                    <h3>2. Eligibility</h3>
                    <p>
                      You must be at least 13 years old to use the Service. If you are under 18, you may use the Service only with the involvement of a parent or guardian. By using the Service, you represent that you meet these eligibility requirements and have the right and authority to enter into this Agreement.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="accounts" className="prose prose-sm max-w-none">
                    <h3>3. Accounts</h3>
                    <p>
                      To access certain features, you may be required to create an account. You agree to provide accurate information and keep your credentials secure. You are responsible for activity that occurs under your account. If you learn of unauthorized use, contact us immediately at <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="use" className="prose prose-sm max-w-none">
                    <h3>4. Use of the Service</h3>
                    <p>
                      Exam Connect provides features such as study reminders, task management, social features (posts, likes, threads), analytics, sleep trackers, and productivity tools. The Service is for personal, non-commercial use unless otherwise agreed.
                    </p>
                    <p>
                      You agree not to misuse the Service, interfere with others' use, or attempt to access the Service by any automated means unless expressly permitted.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="content" className="prose prose-sm max-w-none">
                    <h3>5. User Content</h3>
                    <p>
                      You retain ownership of content you post ("User Content"). By posting, you grant Exam Connect a worldwide, royalty-free, transferable license to host, use, reproduce, modify, publish, and display your User Content to provide and improve the Service.
                    </p>
                    <p>
                      You are responsible for the User Content you upload. Do not post content that violates other people's rights or applicable law.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="prohibited" className="prose prose-sm max-w-none">
                    <h3>6. Prohibited Conduct</h3>
                    <ul>
                      <li>Impersonation, harassment, or stalking of others;</li>
                      <li>Uploading malware, spam, or deceptive content;</li>
                      <li>Using the Service for illegal activities;</li>
                      <li>Attempting to access other users’ accounts or data.</li>
                    </ul>
                  </section>

                  <Separator className="my-4" />

                  <section id="privacy" className="prose prose-sm max-w-none">
                    <h3>7. Privacy</h3>
                    <p>
                      Our Privacy Policy explains how we collect and use your information. By using the Service you consent to our collection and use of data as outlined in the Privacy Policy. The Privacy Policy is available at <Link href="/privacy-policy">/privacy-policy</Link>.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="subscriptions" className="prose prose-sm max-w-none">
                    <h3>8. Subscriptions & Billing</h3>
                    <p>
                      Some features may be offered via paid subscription. Subscriptions are billed in advance and are non-refundable except as required by law. You are responsible for all fees associated with paid features.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="termination" className="prose prose-sm max-w-none">
                    <h3>9. Termination</h3>
                    <p>
                      We may suspend or terminate accounts that violate this Agreement or for operational reasons. Users may deactivate their accounts via the Account Settings page; account deletion requests will follow our data retention practices and applicable law.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="liability" className="prose prose-sm max-w-none">
                    <h3>10. Disclaimers & Limitation of Liability</h3>
                    <p>
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE". EXAM CONNECT DISCLAIMS ALL WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY LAW. EXAM CONNECT IS NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                    </p>
                    <p>
                      TO THE EXTENT PERMITTED BY LAW, THE TOTAL LIABILITY OF EXAM CONNECT FOR ANY CLAIM RELATED TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID, IF ANY, IN THE 12 MONTHS PRECEDING THE CLAIM.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="indemnity" className="prose prose-sm max-w-none">
                    <h3>11. Indemnification</h3>
                    <p>
                      You agree to indemnify and hold harmless Exam Connect and its officers, employees, and agents from claims arising out of your use of the Service or violation of this Agreement.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="governing" className="prose prose-sm max-w-none">
                    <h3>12. Governing Law & Disputes</h3>
                    <p>
                      This Agreement is governed by the laws of India without regard to conflict of law rules. Disputes will be resolved in courts located in India, unless otherwise agreed.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="changes" className="prose prose-sm max-w-none">
                    <h3>13. Changes to Terms</h3>
                    <p>
                      We may modify this Agreement. If changes are material, we will provide notice (by email or in-app) and seek consent when required. Continued use after changes constitutes acceptance of the updated terms.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="children" className="prose prose-sm max-w-none">
                    <h3>14. Children</h3>
                    <p>
                      The Service is not intended for children under 13. If you believe we have collected personal data of a child under 13, contact us at <a href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>.
                    </p>
                  </section>

                  <Separator className="my-4" />

                  <section id="contact" className="prose prose-sm max-w-none">
                    <h3>15. Contact</h3>
                    <p>
                      If you have questions about this Agreement, contact: helpexamconnect@gmail.com
                    </p>
                  </section>

                  <div className="h-6" />
                </ScrollArea>

                <Separator className="my-4" />

                {/* Agreement checkbox (uses onboarding store) */}
<div className="flex flex-col gap-4">
{/* Checkbox + Agreement text */}
<div className="min-w-0 space-y-4">
  
  {/* Newsletter Opt-in Checkbox */}
  <div className="flex items-center gap-3 mt-2">
    <Checkbox
  id="newsletter"
  checked={!!wantsNewsletter}
  onCheckedChange={(v) => setWantsNewsletter(Boolean(v))}
/>
    <label htmlFor="newsletter" className="text-sm">
      I want to receive updates, newsletters, and offers via email.
    </label>
  </div>
</div>
{/* Terms Agreement Checkbox */}
  <div className="flex items-center gap-3">
    <Checkbox
      id="agree"
      checked={!!agreed}
      onCheckedChange={(v) => setField("agreed", Boolean(v))}
    />
    <label htmlFor="agree" className="text-sm">
      I have read and agree to the Exam Connect User Agreement.
    </label>
  </div>

  <p className="-mt-3 text-xs text-muted-foreground max-w-md leading-tight">
    By continuing you accept our{" "}
    <a
      href="/terms-and-conditions"
      target="_blank"
      rel="noreferrer noopener"
      className="text-primary hover:underline"
    >
      Terms &amp; Conditions
    </a>
    ,{" "}
    <a
      href="/privacy-policy"
      target="_blank"
      rel="noreferrer noopener"
      className="text-primary hover:underline"
    >
      Privacy Policy
    </a>{" "}
    and{" "}
    <a
      href="/cookie-policy"
      target="_blank"
      rel="noreferrer noopener"
      className="text-primary hover:underline"
    >
      Cookie Policy
    </a>
    .
  </p>


{/* Action buttons below */}
<div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
  <Button
    variant="outline"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className="w-full sm:w-auto"
  >
    Read from top
  </Button>

  <Button
    onClick={handleSubmit}
    disabled={!agreed || saving} // only require terms agreement, not newsletter
    className="w-full sm:w-auto rounded-full px-6"
  >
    {saving ? "Saving…" : "Accept & Continue"}
  </Button>
</div>
</div>

              </CardContent>
            </Card>
          </article>
        </main>

        
      </div>
    </div>
  );
}
