// src/lib/sm18-utils.ts
import { adminDb } from "./firebaseAdmin";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Get tasks that are due for review
 */
export async function getTasksDueForReview(uid: string, now = new Date()) {
  const tasksSnapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("tasks")
    .where("dueAt", "<=", Timestamp.fromDate(now))
    .get();

  const dueTasks: any[] = [];
  tasksSnapshot.forEach((doc) => {
    dueTasks.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return dueTasks;
}

/**
 * Sync SM-18 task data back to client-side Firestore
 */
export async function syncTaskToClient(uid: string, taskId: string) {
  try {
    const adminTaskRef = adminDb.collection("users").doc(uid).collection("tasks").doc(taskId);
    const adminTask = await adminTaskRef.get();
    
    if (!adminTask.exists()) {
      throw new Error("Admin task not found");
    }

    const adminData = adminTask.data();
    const clientTaskRef = doc(db, "tasks", taskId);
    
    // Update client task with SM-18 data
    const clientUpdates = {
      stability: adminData?.stability,
      difficulty: adminData?.difficulty,
      retrievability: adminData?.retrievability,
      priorityWeight: adminData?.priorityWeight,
      lastReviewedAt: adminData?.lastReviewedAt?.toDate().toISOString(),
      dueAt: adminData?.dueAt?.toDate().toISOString(),
      lapses: adminData?.lapses,
      sleepFactor: adminData?.sleepFactor,
      updatedAt: adminData?.updatedAt?.toDate().toISOString(),
      
      // Update the due date string for client compatibility
      dueDate: adminData?.dueAt?.toDate().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    await updateDoc(clientTaskRef, clientUpdates);
    return { success: true };
  } catch (error) {
    console.error("Failed to sync task to client:", error);
    return { success: false, error };
  }
}

/**
 * Convert legacy priority format to SM-18 format
 */
export function normalizePriority(priority: string | undefined): "low" | "medium" | "high" {
  if (!priority) return "medium";
  
  const lower = priority.toLowerCase();
  if (lower === "low") return "low";
  if (lower === "high") return "high";
  return "medium";
}

/**
 * Calculate relative urgency score for task prioritization
 */
export function calculateUrgencyScore(
  retrievability: number,
  priorityWeight: number,
  daysUntilDue: number
): number {
  // Higher score = more urgent
  const retrievabilityUrgency = (1 - retrievability) * 100; // 0-100
  const priorityUrgency = (1 - priorityWeight) * 100; // 0-15 roughly
  const timeUrgency = Math.max(0, (7 - daysUntilDue) * 10); // More urgent as due date approaches
  
  return retrievabilityUrgency + priorityUrgency + timeUrgency;
}

/**
 * Get prioritized task list for study recommendations
 */
export async function getPrioritizedTasksForUser(uid: string, limit = 10) {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const tasksSnapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("tasks")
    .where("dueAt", "<=", Timestamp.fromDate(sevenDaysFromNow))
    .get();

  const tasks: any[] = [];
  tasksSnapshot.forEach((doc) => {
    const data = doc.data();
    const dueAt = data.dueAt?.toDate() || now;
    const daysUntilDue = (dueAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    
    const urgencyScore = calculateUrgencyScore(
      data.retrievability || 0.5,
      data.priorityWeight || 0.9,
      daysUntilDue
    );

    tasks.push({
      id: doc.id,
      urgencyScore,
      daysUntilDue,
      ...data,
    });
  });

  // Sort by urgency score (descending)
  tasks.sort((a, b) => b.urgencyScore - a.urgencyScore);
  
  return tasks.slice(0, limit);
}

/**
 * Bulk sync multiple tasks to client
 */
export async function bulkSyncTasksToClient(uid: string, taskIds: string[]) {
  const results = await Promise.allSettled(
    taskIds.map(taskId => syncTaskToClient(uid, taskId))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  return { successful, failed, total: results.length };
}
