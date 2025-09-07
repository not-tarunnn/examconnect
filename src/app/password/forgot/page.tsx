// app/password/forgot/page.tsx
"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://examconnect.vercel.app/password/reset", // ✅ valid
        handleCodeInApp: true,
      });
      setMessage("✅ Reset link sent! Check your email.");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96 space-y-4"
      >
        <h1 className="text-xl font-bold text-white">Forgot Password</h1>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
        >
          Send Reset Link
        </button>

        {message && <p className="text-gray-300 text-sm">{message}</p>}
      </form>
    </div>
  );
}
