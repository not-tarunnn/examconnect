"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, FileText, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

const LAST_UPDATED = "August 19, 2025";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12">
      <main className="max-w-5xl mx-auto px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-gradient-to-br from-white to-gray-100 rounded-xl p-3 shadow-inner">
              <FileText className="w-8 h-8 stroke-1 text-gray-700" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Terms &amp; Conditions</h1>
              <p className="mt-1 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
              <p className="mt-3 text-sm text-gray-600 max-w-prose">
                Welcome to <span className="font-medium">ExamConnect</span>. These Terms &amp; Conditions
                ("Terms") govern your access to and use of the ExamConnect web and mobile services,
                community features, and any content or functionality we provide (collectively,
                the "Service"). Please read carefully.
              </p>
            </div>
          </div>
        </motion.header>

        <div className="mt-8 grid md:grid-cols-4 gap-8">
          {/* Table of contents - visible on md+ */}
          <aside className="hidden md:block md:col-span-1 sticky top-28 self-start">
            <nav className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-sm font-semibold mb-3">Contents</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <button onClick={() => scrollToId("acceptance")} className="w-full text-left">
                    Acceptance of Terms
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("use-of-service")} className="w-full text-left">
                    Use of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("accounts")} className="w-full text-left">
                    Accounts &amp; Security
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("subscriptions")} className="w-full text-left">
                    Subscriptions &amp; Payments
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("ugc")} className="w-full text-left">
                    User Content
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("prohibited")} className="w-full text-left">
                    Prohibited Conduct
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("termination")} className="w-full text-left">
                    Termination
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("disclaimer")} className="w-full text-left">
                    Disclaimers &amp; Liability
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("jurisdiction")} className="w-full text-left">
                    Governing Law
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("changes")} className="w-full text-left">
                    Changes
                  </button>
                </li>
              </ul>
            </nav>

            <div className="mt-4 text-xs text-gray-500">
              <p>Need help? Email us at</p>
              <a href="mailto:helpexamconnect@gmail.com" className="inline-flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4" />
                <span>helpexamconnect@gmail.com</span>
              </a>
            </div>
          </aside>

          <article className="md:col-span-3 space-y-8">
            {/* Acceptance */}
            <motion.section id="acceptance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="mt-3 text-gray-600">
                By accessing or using ExamConnect you agree to these Terms. If you do not agree,
                please do not use the Service. These Terms are a binding contract between you and
                ExamConnect ("we", "us", "our").
              </p>
            </motion.section>

            {/* Use of Service */}
            <motion.section id="use-of-service" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">2. Use of the Service</h2>
              <p className="mt-3 text-gray-600">
                The Service is intended for students and educators for study planning, task
                management, timed study sessions (Pomodoro), sleep tracking, and community
                discussion. You must use the Service only for lawful purposes and in a way that
                does not infringe the rights of others.
              </p>
              <ul className="mt-3 list-inside list-disc text-gray-600">
                <li>Eligibility: You must be at least 13 years old to use ExamConnect. If you are under the required age for your country, do not use the Service.</li>
                <li>Prohibited automated access: Scraping, automated data harvesting or other programmatic access is not allowed without our written permission.</li>
              </ul>
            </motion.section>

            {/* Accounts */}
            <motion.section id="accounts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">3. Accounts &amp; Security</h2>
              <p className="mt-3 text-gray-600">
                When you create an account you agree to provide accurate information and keep your
                credentials secure. You are responsible for all activity that occurs under your
                account. Notify us immediately at <a className="text-indigo-600 underline" href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a> if you suspect unauthorized use.
              </p>
            </motion.section>

            {/* Subscriptions & Payments */}
            <motion.section id="subscriptions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">4. Subscriptions &amp; Payments</h2>
              <p className="mt-3 text-gray-600">
                Some parts of the Service (e.g., premium study plans or cookie subscription products)
                may require payment. By subscribing you agree to the payment terms presented at
                purchase. Payments are processed by third-party payment providers and are subject
                to their terms.
              </p>
              <ul className="mt-3 list-disc list-inside text-gray-600">
                <li>Automatic Renewal: Paid subscriptions may auto-renew unless canceled prior to the renewal date.</li>
                <li>Refunds: Refunds are handled according to the policy shown at checkout. Contact support for disputes.</li>
              </ul>
            </motion.section>

            {/* User Content */}
            <motion.section id="ugc" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">5. User-Generated Content</h2>
              <p className="mt-3 text-gray-600">
                The Service may include forums, posts, comments, and other content submitted by
                users. You retain ownership of what you post, but by posting you grant ExamConnect a
                worldwide, royalty-free license to use, reproduce, and display that content to
                operate and promote the Service.
              </p>
              <p className="mt-3 text-gray-600 font-medium">Moderation</p>
              <p className="text-gray-600">We may remove or restrict content that violates these Terms or our Community Guidelines. We reserve the right to moderate, suspend, or remove content at our discretion.</p>
            </motion.section>

            {/* Prohibited Conduct */}
            <motion.section id="prohibited" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">6. Prohibited Conduct</h2>
              <p className="mt-3 text-gray-600">You must not:</p>
              <ul className="mt-3 list-inside list-disc text-gray-600">
                <li>Post unlawful, abusive, harassing, or infringing content.</li>
                <li>Attempt to access or interfere with other users' accounts or the Service infrastructure.</li>
                <li>Use the Service to harm minors or solicit personal data in violation of applicable law.</li>
              </ul>
            </motion.section>

            {/* Termination */}
            <motion.section id="termination" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">7. Termination</h2>
              <p className="mt-3 text-gray-600">We may suspend or terminate your account for breaches of these Terms, or for any other reason where permitted by law. On termination, your access to paid features will end and certain content may be deleted.</p>
            </motion.section>

            {/* Disclaimers & Liability */}
            <motion.section id="disclaimer" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">8. Disclaimers &amp; Limitation of Liability</h2>
              <p className="mt-3 text-gray-600">The Service is provided "as is". To the fullest extent permitted by law, ExamConnect disclaims all warranties, whether express or implied. We are not liable for indirect, incidental, consequential, or punitive damages arising from your use of the Service.</p>
              <p className="mt-3 text-gray-600">ExamConnect provides educational tools and community features but does not provide professional, legal, medical, or financial advice. Always consult a qualified professional for specific concerns.</p>
            </motion.section>

            {/* Indemnity */}
            <motion.section id="indemnity" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">9. Indemnification</h2>
              <p className="mt-3 text-gray-600">You agree to indemnify and hold ExamConnect and its affiliates harmless from any claims, losses, liabilities, or expenses arising from your violation of these Terms or your misuse of the Service.</p>
            </motion.section>

            {/* Governing Law */}
            <motion.section id="jurisdiction" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">10. Governing Law</h2>
              <p className="mt-3 text-gray-600">These Terms are governed by the laws of India. If you are a user located elsewhere, you agree that Indian law will govern any dispute, except where local mandatory laws provide otherwise.</p>
            </motion.section>

            {/* Changes */}
            <motion.section id="changes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">11. Changes to These Terms</h2>
              <p className="mt-3 text-gray-600">We may update these Terms from time to time. We will post the revised Terms with a new "Last updated" date. Continued use after changes indicates acceptance.</p>
            </motion.section>

            {/* Contact */}
            <motion.section id="contact" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-semibold">12. Contact &amp; Questions</h2>
              <p className="mt-3 text-gray-600">If you have questions about these Terms, please contact us:</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-5 h-5" />
                <a className="underline text-indigo-600" href="mailto:helpexamconnect@gmail.com">helpexamconnect@gmail.com</a>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Privacy notice: Your use of the Service is also governed by our <Link href="/privacy-policy" className="text-indigo-600 underline">Privacy Policy</Link>.</p>
                <p className="mt-2">To view our contact page, go to <Link href="/contact" className="text-indigo-600 underline">Contact</Link>.</p>
              </div>

    
            </motion.section>
          </article>
        </div>
      </main>
    </div>
  );
}
