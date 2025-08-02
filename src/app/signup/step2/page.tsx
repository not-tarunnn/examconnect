"use client";

import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import clsx from "clsx";

const classOptions = ["11", "12", "12-pass", "Graduate"];
const examOptions = ["JEE", "NEET", "CUET", "UPSC-CSE", "Others"];

export default function Step2() {
  const router = useRouter();
  const {
    classLevel,
    targetExam,
    chronotype,
    avgSleepTime,
    setField,
  } = useOnboardingStore();

  const handleNext = () => {
    router.push("/signup/step3");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 flex flex-col items-center text-black">
      <div className="w-full max-w-lg space-y-6">
        {/* Class Selection */}
        <div>
  <h2 className="text-xl font-semibold mb-2">Your Class</h2>
  <div className="grid grid-cols-3 gap-3">
    {classOptions.map((cls) => (
      <div
        key={cls}
        onClick={() => setField("classLevel", cls)}
        className={clsx(
          "cursor-pointer rounded-xl bg-white shadow-md hover:shadow-lg transition transform hover:-translate-y-1 p-4 text-center font-medium",
          classLevel === cls
            ? "bg-blue-50 shadow-lg text-blue-700 outline outline-blue-600 outline-2"
            : "text-black"
        )}
      >
        {cls}
      </div>
    ))}
  </div>
</div>

        {/* Exam Selection */}
        <div>
  <h2 className="text-xl font-semibold mb-2">Target Exam</h2>
  <div className="grid grid-cols-3 gap-3">
    {examOptions.map((exam) => (
      <div
        key={exam}
        onClick={() => setField("targetExam", exam)}
        className={clsx(
          "cursor-pointer rounded-xl bg-white shadow-md hover:shadow-lg transition transform hover:-translate-y-1 p-4 text-center font-medium uppercase",
          targetExam === exam
            ? "bg-blue-50 shadow-lg text-blue-700 outline outline-blue-600 outline-2"
            : "text-black"
        )}
      >
        {exam}
      </div>
    ))}
  </div>
</div>

        {/* Chronotype Toggle */}
       <div>
  <h2 className="text-xl font-semibold mb-2">Are you a...</h2>
  <div className="grid grid-cols-2 gap-4">
    {["morning", "night"].map((value) => (
      <button
        key={value}
        onClick={() => setField("chronotype", value)}
        className={clsx(
          "w-full rounded-xl p-4 text-center font-medium transition transform bg-white shadow-md hover:shadow-lg hover:-translate-y-1",
          chronotype === value
            ? "bg-blue-50 shadow-lg text-blue-700 outline outline-blue-600 outline-2"
            : "text-black"
        )}
      >
        {value === "morning" ? "Morning Eagle" : "Night Owl"}
      </button>
    ))}
  </div>
</div>


        {/* Sleep Input */}
        <div>
          <label htmlFor="sleep" className="block mb-1 text-sm font-medium text-black">
            Average Sleep Time (hours)
          </label>
          <input
            id="sleep"
            type="number"
            min={0}
            max={24}
            value={avgSleepTime ?? ""}
            onChange={(e) => setField("avgSleepTime", parseFloat(e.target.value))}
            placeholder="e.g. 7.5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
          />
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleNext}
            className="rounded-full bg-white text-blue-600 border border-blue-600 hover:bg-white hover:translate-y-[-2px] hover:shadow-lg active:translate-y-0 active:shadow-sm transition-all duration-200 ease-in-out px-6 py-2 font-semibold"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
