"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function Step3() {
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
    const user = auth.currentUser;
    if (!user) return alert("User not authenticated");

    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      throw new Error("User is not authenticated");
    }

    const finalProfilePic = profilePic || user.photoURL || "";

    // Save main user document
    await setDoc(doc(db, "users", uid), {
      username,
      fullName,
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
    await setDoc(doc(db, "usernames", username), { uid });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6 bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-black">Agreements</h2>

        <label className="flex items-start gap-3 text-black">
  <input
    type="checkbox"
    checked={!!agreed}
    onChange={(e) => setField("agreed", e.target.checked)}
    className="mt-1 accent-blue-600"
  />
  <span>
    I agree to the{" "}
    <span className="text-blue-600 underline cursor-pointer">Terms</span>,{" "}
    <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>, and{" "}
    <span className="text-blue-600 underline cursor-pointer">Cookies</span>.
  </span>
</label>


        <button
          disabled={!agreed}
          onClick={handleSubmit}
          className={`w-full py-3 rounded-full transition-all text-center font-semibold ${
            agreed
              ? "bg-blue-600 text-white hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Finish →
        </button>
      </div>
    </div>
  );
}
