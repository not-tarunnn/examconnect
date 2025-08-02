"use client";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import {
  auth,
  googleProvider,
  facebookProvider,
  appleProvider,
} from "@/lib/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const allowedEmailDomains = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "aol.com",
  "zoho.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "mail.com",
];

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  return allowedEmailDomains.includes(domain);
};

export default function SignupPage() {

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const storeAndRedirect = (email: string, photoURL?: string) => {
    localStorage.setItem("signup_email", email);
    if (photoURL) localStorage.setItem("signup_photo", photoURL);
    router.push("/signup/step1");
  };

  const signupWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      storeAndRedirect(user.email ?? "", user.photoURL ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google signup failed.");
    }
  };

  const signupWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      storeAndRedirect(user.email ?? "", user.photoURL ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Facebook signup failed.");
    }
  };

  const signupWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      storeAndRedirect(user.email ?? "", user.photoURL ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple signup failed.");
    }
  };

  const signupWithEmail = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError("Please use a valid email.");
      return;
    }
    
    try {
    await createUserWithEmailAndPassword(auth, email, password);
    localStorage.setItem("signup_email", email);
    localStorage.setItem("signup_password", password);
    router.push("/signup/step1");
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes("google.com")) {
          setError("This email is already registered with Google. Please sign in with Google.");
        } else if (methods.includes("facebook.com")) {
          setError("This email is registered with Facebook. Please sign in with Facebook.");
        } else if (methods.includes("apple.com")) {
          setError("This email is registered with Apple. Please sign in with Apple.");
        } else {
          setError("This email is already in use. Try logging in.");
        }
      } catch (innerErr) {
        setError("Email already in use, and we couldn't detect the sign-in method.");
      }
    } else {
      setError(err.message ?? "Email signup failed.");
    }
  }
};

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white text-slate-900">
      {/* Header */}
      <div className="w-full text-center pt-16">
        <h1 className="text-5xl font-bold">Sign Up</h1>
        <p className="mt-2 text-base text-slate-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log In
          </a>
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 w-full flex justify-center items-center px-4">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-start md:items-center gap-12 mt-8">
          {/* Left: Email signup */}
          <div className="flex-1 w-full">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border-b border-blue-500 focus:outline-none focus:border-blue-600 py-2"
            />

            <label
              htmlFor="password"
              className="block text-sm font-medium mt-6 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full border-b border-blue-500 focus:outline-none focus:border-blue-600 py-2"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Email Signup Button */}
            <button
              onClick={signupWithEmail}
              className="mt-6 px-6 py-3 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 transition text-sm"
            >
              Sign Up with Email →
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:flex items-center justify-center px-6">
            <div className="w-px h-32 bg-gray-300 relative">
              <div className="absolute -left-3 -top-4 bg-white px-2 text-sm text-gray-500">
                or
              </div>
            </div>
          </div>
          <div className="block md:hidden text-center text-sm text-gray-500">
            or
          </div>

          {/* Right: Social Signups */}
          <div className="flex-1 w-full space-y-4">
            <button
              onClick={signupWithGoogle}
              className="w-full flex items-center justify-start gap-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <span className="bg-white p-2 rounded-full">
                <FcGoogle size={20} />
              </span>
              <span className="flex-1 text-left">Continue with Google</span>
            </button>

            <button
              onClick={signupWithFacebook}
              className="w-full flex items-center justify-start gap-4 px-4 py-3 bg-[#3b5998] hover:bg-[#334d84] text-white rounded-md"
            >
              <span className="bg-white p-2 rounded-full text-[#3b5998]">
                <FaFacebookF size={18} />
              </span>
              <span className="flex-1 text-left">Continue with Facebook</span>
            </button>

            <button
              onClick={signupWithApple}
              className="w-full flex items-center justify-start gap-4 px-4 py-3 border border-black rounded-md hover:bg-gray-50"
            >
              <span className="bg-white p-2 rounded-full text-black">
                <FaApple size={20} />
              </span>
              <span className="flex-1 text-left">Continue with Apple</span>
            </button>

            <div className="text-center pt-3">
              <a href="#" className="text-blue-600 hover:underline text-sm">
                Continue with SSO
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-700 px-6 pb-6">
        <div className="space-x-4 mb-2">
          <a
            href="#"
            className="hover:underline text-blue-600 transition-colors duration-200"
          >
            Terms of Use
          </a>
          <a
            href="/privacypolicy"
            className="hover:underline text-blue-600 transition-colors duration-200"
          >
            Privacy Policy
          </a>
        </div>
        <p className="text-gray-600">
          This site is protected by reCAPTCHA Enterprise.{" "}
          <a
            href="#"
            className="hover:underline text-blue-600 transition-colors duration-200"
          >
            Google’s Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="hover:underline text-blue-600 transition-colors duration-200"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </footer>
    </div>
  );
}
