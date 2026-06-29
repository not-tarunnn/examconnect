"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple, FaUserAlt } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import {
  auth,
  googleProvider,
  facebookProvider,
  appleProvider,
  db,
} from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { initializeLocationLogging } from "@/lib/userLocationService";
import { query, collection, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");  // <-- Add password state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userId = result.user.uid;
      // Log user location data in background
      initializeLocationLogging(userId).catch(console.error);
      router.push("/task");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Google login failed.");
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const userId = result.user.uid;
      // Log user location data in background
      initializeLocationLogging(userId).catch(console.error);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Facebook login failed.");
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const userId = result.user.uid;
      // Log user location data in background
      initializeLocationLogging(userId).catch(console.error);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Apple login failed.");
    }
  };

 const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    const userId = result.user.uid;
    // Log user location data in background
    initializeLocationLogging(userId).catch(console.error);
    router.push("/dashboard");
  } catch (err) {
    if (err instanceof Error) setError(err.message);
    else setError("Anonymous login failed.");
  }
};


  const getEmailFromUsername = async (username: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().email;
      }
      return null;
    } catch (err) {
      console.error("Error looking up username:", err);
      return null;
    }
  };

  const loginWithEmail = async () => {
    setError(""); // reset error
    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      let loginEmail = email;

      // Check if input is a username (doesn't contain @)
      if (!email.includes("@")) {
        const foundEmail = await getEmailFromUsername(email);
        if (!foundEmail) {
          setError("Username not found.");
          return;
        }
        loginEmail = foundEmail;
      }

      const result = await signInWithEmailAndPassword(auth, loginEmail, password);
      const userId = result.user.uid;
      // Log user location data in background
      initializeLocationLogging(userId).catch(console.error);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-white text-slate-900">
      {/* Header */}
      <div className="w-full text-center pt-16">
        <h1 className="text-5xl font-bold">Log In</h1>
        <p className="mt-2 text-base text-slate-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 w-full flex justify-center items-center px-4">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-start md:items-center gap-12 mt-8">
          {/* Left: Email login */}
          <form
  onSubmit={(e) => {
    e.preventDefault(); // Prevent default form submission behavior (like reloading the page)
    loginWithEmail();   // Call your existing login function
  }}
  className="flex-1 w-full"
>
  <label htmlFor="email" className="block text-sm font-medium mb-1">
    Email or Username
  </label>
  <input
    type="text"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email or username"
    className="w-full border-b border-blue-500 focus:outline-none focus:border-blue-600 py-2"
    required
  />

  <label
    htmlFor="password"
    className="block text-sm font-medium mt-6 mb-1"
  >
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      className="w-full border-b border-blue-500 focus:outline-none focus:border-blue-600 py-2 pr-10"
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-blue-600 transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  <div className="mt-2 mb-6">
    <a href="/password/forgot" className="text-sm text-blue-600 hover:underline">
      Forgot Password?
    </a>
  </div>


  {error && (
    <p className="text-red-600 text-sm mb-2">{error}</p>
  )}

  <button
    type="submit"
    className="mt-2 px-6 py-3 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 transition text-sm"
  >
    Continue with Email →
  </button>
</form>


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

          {/* Right: Social Logins */}
          <div className="flex-1 w-full space-y-4">

{/* <button
  onClick={loginAnonymously}
  className="w-full flex items-center justify-start gap-4 px-4 py-3 border border-black rounded-md hover:bg-gray-50"
>
  <span className="bg-white p-2 rounded-full text-black">
    <FaUserAlt size={20} />
  </span>
  <span className="flex-1 text-left">Continue as Guest</span>
</button> */}

            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-start gap-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <span className="bg-white p-2 rounded-full">
                <FcGoogle size={20} />
              </span>
              <span className="flex-1 text-left">Continue with Google</span>
            </button>

            <button
              onClick={loginWithFacebook}
              className="w-full flex items-center justify-start gap-4 px-4 py-3 bg-[#3b5998] hover:bg-[#334d84] text-white rounded-md"
            >
              <span className="bg-white p-2 rounded-full text-[#3b5998]">
                <FaFacebookF size={18} />
              </span>
              <span className="flex-1 text-left">Continue with Facebook</span>
            </button>

            <button
              onClick={loginWithApple}
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
            href="/terms-and-conditions"
            className="hover:underline text-blue-600 transition-colors duration-200"
          >
            Terms & Conditions
          </a>
          <a
            href="/privacy-policy"
            className="hover:underline text-blue-600  transition-colors duration-200"
          >
            Privacy Policy
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
  This site is protected by reCAPTCHA Enterprise and the Google{" "}
  <a
    href="https://policies.google.com/privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:underline"
  >
    Privacy Policy
  </a>{" "}
  and{" "}
  <a
    href="https://policies.google.com/terms"
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:underline"
  >
    Terms of Service
  </a>{" "}
  apply.
</p>

      </footer>
    </div>
  );
}
