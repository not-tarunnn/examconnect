"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "done" | "error">(
    "checking"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setStatus("error");
      setMessage("❌ Invalid reset link.");
      return;
    }

    // Step 1: Verify reset code
    verifyPasswordResetCode(auth, oobCode)
      .then(async (email) => {
        // Step 2: Check providers for this email
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.includes("google.com") && !methods.includes("password")) {
          setStatus("error");
          setMessage("⚠️ This account is linked with Google. Please sign in using Google instead.");
        } else {
          setStatus("ready");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("❌ Reset link expired or invalid.");
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords don’t match.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus("done");
      setMessage("✅ Password reset successful! You can log in now.");
    } catch (err: any) {
      setStatus("error");
      setMessage(`❌ ${err.message}`);
    }
  };

  if (status === "checking") {
    return <p className="text-white text-center">Verifying link...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-96 space-y-4"
      >
        <h1 className="text-xl font-bold text-white">Reset Password</h1>

        {status === "ready" && (
          <>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
            >
              Reset Password
            </button>
          </>
        )}

        {message && <p className="text-gray-300 text-sm">{message}</p>}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
