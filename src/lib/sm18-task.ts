// lib/sm18-task.ts
import { adminDb} from "./firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { userRatingToDifficulty, calculateAdaptiveDifficulty, validateUserRating } from "./rating-difficulty-converter";

/**
 * Grade mapping:
 * 1 = fail (again)
 * 2 = tried but failed (soft fail)
 * 3 = partial success (hard)
 * 4 = good
 * 5 = easy (perfect)
 */

// ---------------- Types ----------------
export type Priority = "high" | "medium" | "low";

export interface TaskDoc {
  title?: string;
  stability?: number;             // days (half-life)
  difficulty?: number;            // 0..1 (1 = very hard)
  retrievability?: number;        // predicted retrievability at next due (0..1)
  priority?: Priority;
  priorityWeight?: number;        // numeric: 0.95/0.90/0.85
  lastReviewedAt?: FirebaseFirestore.Timestamp | null;
  dueAt?: FirebaseFirestore.Timestamp | null;
  lapses?: number;
  sleepFactor?: number;           // cached last factor used
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

// ---------------- Constants & params ----------------
const MS_PER_DAY = 86_400_000;

const Params = {
  // stability update
  sGain: 0.60,
  sGainByEase: 0.50,
  sGainByStruggle: 0.80,
  sLoss: 0.35,
  sLossBySurprise: 0.45,
  sMin: 0.20,
  sMax: 3650,

  // difficulty updates
  dDownOnSuccess: 0.10,
  dUpOnFailure: 0.18,

  // learning windows for failure grades (minutes)
  againLearningMinutes: 10,   // grade 1
  hardRelearnMinutes: 60,     // grade 2
};

// ---------------- Helpers ----------------
function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

function retrievability(elapsedDays: number, stabilityDays: number) {
  const S = Math.max(stabilityDays, 1e-9);
  return Math.pow(0.5, elapsedDays / S);
}

function intervalForTargetR(targetR: number, stabilityDays: number) {
  if (targetR <= 0) return 0.15;
  const lnHalf = Math.log(0.5);
  return Math.max(0.15, stabilityDays * (Math.log(targetR) / lnHalf));
}

export function priorityToWeight(p?: Priority): number {
  if (p === "high") return 0.95;
  if (p === "medium") return 0.90;
  if (p === "low") return 0.85;
  return 0.90;
}

// ---------------- Sleep (weekly average) ----------------
function mapSleepHoursToFactor(avgHours: number): number {
  const h = Math.max(6, Math.min(10, avgHours));
  const factor = 0.85 + ((h - 6) / 4) * 0.30; // linear map 6->0.85, 8->1.00, 10->1.15
  return Math.max(0.85, Math.min(1.15, Number(factor.toFixed(3))));
}

export async function getWeeklySleepFactor(uid: string, now = new Date()) {
  const start = new Date(now.getTime() - 6 * MS_PER_DAY); // last 7 days including today
  const startStr = start.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const snap = await adminDb
    .collection("sleepData")
    .where("uid", "==", uid)
    .where("date", ">=", startStr)
    .get();

  const hours: number[] = [];
  snap.forEach((d) => {
    const v = d.get("duration");
    if (typeof v === "number" && isFinite(v) && v > 0) hours.push(v);
  });

  const avg = hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : 8;
  return { avgHours: Number(avg.toFixed(2)), factor: mapSleepHoursToFactor(avg) };
}

// ---------------- Grade → behaviour ----------------
/**
 * Grades:
 * 1 -> full failure (again)
 * 2 -> tried but failed (soft failure)
 * 3 -> partial success (hard)
 * 4 -> good
 * 5 -> easy
 */
function gradeCategory(grade: number) {
  if (grade <= 1) return "again";
  if (grade === 2) return "failed_tried";
  if (grade === 3) return "hard";
  if (grade === 4) return "good";
  return "easy";
}

function gradeTargetR(grade: number) {
  // baseline grade-targets (before priority influence)
  if (grade <= 1) return 0.0;
  if (grade === 2) return 0.50; // soft fail — we want a quick revisit but not immediate forget
  if (grade === 3) return 0.65;
  if (grade === 4) return 0.75;
  return 0.85;
}

// ---------------- Core: compute next state given grade ----------------
export function computeNextStateGivenGrade({
  prevStability,
  prevDifficulty,
  lastReviewedAt,
  grade,
  priorityWeight,
  sleepFactor,
  userRating,
  previousRatings = [],
  now = new Date(),
}: {
  prevStability: number;
  prevDifficulty: number;
  lastReviewedAt?: FirebaseFirestore.Timestamp | null;
  grade: number;
  priorityWeight: number;
  sleepFactor: number;
  userRating?: number; // 1-5 user rating
  previousRatings?: number[]; // history of user ratings
  now?: Date;
}) {
  const elapsed =
    lastReviewedAt?.toMillis ? Math.max(0, (now.getTime() - lastReviewedAt.toMillis()) / MS_PER_DAY) : 0;

  const Rprev = retrievability(elapsed, prevStability);

  let Snew = prevStability;
  let Dnew = prevDifficulty;
  let intervalDays = 0;
  let dueAt = new Date(now.getTime());
  let lapsesDelta = 0;

  const cat = gradeCategory(grade);

  if (cat === "again" || cat === "failed_tried") {
    // FAILURE PATH
    const severity = cat === "again" ? 1.0 : 0.6; // grade1 stronger penalty than grade2
    const loss = Params.sLoss * (1 + Params.sLossBySurprise * Rprev) * severity;
    Snew = clamp(prevStability * (1 - loss), Params.sMin, Params.sMax);

    const dInc = Params.dUpOnFailure * severity;
    Dnew = clamp(prevDifficulty + dInc, 0, 1);

    lapsesDelta = cat === "again" ? 1 : 1; // increment lapses for both; you can change to only grade1 if desired

    // schedule short relearn window
    const minutes = cat === "again" ? Params.againLearningMinutes : Params.hardRelearnMinutes;
    intervalDays = Math.max(0.01, minutes / (60 * 24)); // in days
    dueAt = new Date(now.getTime() + intervalDays * MS_PER_DAY);
  } else {
    // SUCCESS PATH (grades 3,4,5)
    const gradeTarget = gradeTargetR(grade);
    // small priority influence (scale targetR slightly by priority weight)
    const finalTargetR = clamp(gradeTarget * (1 + (priorityWeight - 0.9)), 0.01, 0.98);

    // growth factors
    const easeBonus = 1 + Params.sGainByEase * (1 - prevDifficulty);
    const struggleBonus = 1 + Params.sGainByStruggle * (1 - Rprev);

    const gradeMultiplier = grade === 3 ? 0.7 : grade === 4 ? 1.0 : 1.25;

    const growth = Params.sGain * easeBonus * struggleBonus * gradeMultiplier * sleepFactor;
    Snew = clamp(prevStability * (1 + growth), Params.sMin, Params.sMax);

    // difficulty goes down a bit
    const dDownFactor = (0.5 + 0.5 * Rprev) * (gradeMultiplier / 1.25);
    Dnew = clamp(prevDifficulty - Params.dDownOnSuccess * dDownFactor, 0, 1);

    intervalDays = intervalForTargetR(finalTargetR, Snew);
    dueAt = new Date(now.getTime() + intervalDays * MS_PER_DAY);
  }

  // Apply user rating to difficulty conversion if user rating is provided
  if (userRating && validateUserRating(userRating)) {
    const algorithmicDifficulty = Dnew;
    const userBasedDifficulty = calculateAdaptiveDifficulty(
      prevDifficulty,
      userRating,
      previousRatings,
      0.4 // adaptation rate - balance between user feedback and algorithm
    );

    // Blend algorithmic and user-based difficulty (70% user, 30% algorithm)
    Dnew = algorithmicDifficulty * 0.3 + userBasedDifficulty * 0.7;
    Dnew = clamp(Dnew, 0, 1);
  }

  const predictedRetrievabilityNext = retrievability(intervalDays, Snew);

  return {
    Rprev,
    Snew,
    Dnew,
    intervalDays,
    dueAt,
    lapsesDelta,
    predictedRetrievabilityNext,
  };
}

// ---------------- Transaction: update task and write history ----------------
export async function reviewTaskWithGrade({
  uid,
  taskId,
  grade,
  userRating,
  now = new Date(),
}: {
  uid: string;
  taskId: string;
  grade: number; // 1..5
  userRating?: number; // 1-5 user performance rating
  now?: Date;
}) {
  if (!uid) throw new Error("uid required");
  if (typeof grade !== "number" || grade < 1 || grade > 5) throw new Error("grade must be 1..5");

  const taskRef = adminDb.collection("users").doc(uid).collection("tasks").doc(taskId);

  // precompute sleep factor
  const { avgHours, factor: sleepFactor } = await getWeeklySleepFactor(uid, now);

  let out: any = null;

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(taskRef);
    if (!snap.exists) throw new Error("task not found");

    const task = snap.data() as TaskDoc;

    const prevStability = typeof task.stability === "number" ? task.stability : 2.5;
    const prevDifficulty = typeof task.difficulty === "number" ? task.difficulty : 0.5;
    const lastReviewedAt = task.lastReviewedAt ?? null;
    const prevLapses = task.lapses ?? 0;
    const priorityWeight = typeof task.priorityWeight === "number" ? task.priorityWeight : priorityToWeight(task.priority);

    const next = computeNextStateGivenGrade({
      prevStability,
      prevDifficulty,
      lastReviewedAt,
      grade,
      priorityWeight,
      sleepFactor,
      now,
    });

    // update the task document
    const updatedDoc: Partial<TaskDoc> = {
      stability: Number(next.Snew.toFixed(6)),
      difficulty: Number(next.Dnew.toFixed(6)),
      retrievability: Number(next.predictedRetrievabilityNext.toFixed(4)),
      priorityWeight,
      sleepFactor,
      lastReviewedAt: Timestamp.fromDate(now),
      dueAt: Timestamp.fromDate(next.dueAt),
      lapses: prevLapses + next.lapsesDelta,
      updatedAt: Timestamp.now(),
    };

    tx.update(taskRef, updatedDoc);

    // write review history doc
    const reviewRef = taskRef.collection("reviews").doc();
    const reviewDoc = {
      timestamp: Timestamp.fromDate(now),
      grade,
      prevStability,
      newStability: Number(next.Snew.toFixed(6)),
      prevDifficulty,
      newDifficulty: Number(next.Dnew.toFixed(6)),
      prevRetrievability: Number(next.Rprev.toFixed(6)),
      predictedRetrievabilityNext: Number(next.predictedRetrievabilityNext.toFixed(6)),
      intervalDays: Number(next.intervalDays.toFixed(6)),
      dueAt: Timestamp.fromDate(next.dueAt),
      sleepAvgHours: avgHours,
      sleepFactor,
      priorityWeight,
    };

    tx.set(reviewRef, reviewDoc);

    out = {
      ok: true,
      ...reviewDoc,
    };
  })

  return out;
}
