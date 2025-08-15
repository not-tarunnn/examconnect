import HeaderX from "@/components/HeaderX";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | ExamConnect",
  description: "Get in touch with the ExamConnect team for support, feedback, or inquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <HeaderX />

      {/* Main content */}
      <main className="flex-grow flex justify-center items-start px-4 py-12">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          <p className="mb-4">
            Have questions, feedback, or need support? We’d love to hear from you.  
            You can reach us directly at:{" "}
            <a
              href="mailto:helpexamconnect@gmail.com"
              className="text-blue-600 underline"
            >
              helpexamconnect@gmail.com
            </a>
          </p>

          <form className="bg-white text-black p-6 shadow-md rounded-md space-y-4" method="POST" action="#">
            <div>
              <label htmlFor="name" className="block font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-medium mb-1">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full border rounded px-3 py-2"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Message
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            We typically respond within 24-48 hours.
          </p>
        </div>
      </main>
    </div>
  );
}
