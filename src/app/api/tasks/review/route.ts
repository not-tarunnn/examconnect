// app/api/tasks/review/route.ts
import { NextResponse } from "next/server";
import { reviewTaskWithGrade, priorityToWeight } from "@/lib/sm18-task";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { taskId, uid, grade } = await req.json();
    
    if (!taskId) return NextResponse.json({ ok: false, error: "taskId required" }, { status: 400 });
    if (!uid) return NextResponse.json({ ok: false, error: "uid required" }, { status: 400 });
    if (typeof grade !== "number" || grade < 1 || grade > 5) {
      return NextResponse.json({ ok: false, error: "grade must be 1-5" }, { status: 400 });
    }

    // Get the task from client-side tasks collection (admin SDK)
    const clientTaskRef = adminDb.collection("tasks").doc(taskId);
    const clientTaskSnap = await clientTaskRef.get();
    
    if (!clientTaskSnap.exists()) {
      return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });
    }

    const clientTask = clientTaskSnap.data();
    
    // Ensure the task has SM-18 fields initialized, if not, set defaults
    const adminTaskRef = adminDb.collection("users").doc(uid).collection("tasks").doc(taskId);
    const adminTaskSnap = await adminTaskRef.get();
    
    if (!adminTaskSnap.exists()) {
      // Initialize SM-18 task in admin collection
      const priority = clientTask?.priority?.toLowerCase() || "medium";
      const now = new Date();
      
      const initialTask = {
        title: clientTask?.title || "Untitled Task",
        stability: 2.5, // default initial stability
        difficulty: 0.5, // default initial difficulty
        retrievability: 0.9,
        priority: priority,
        priorityWeight: priorityToWeight(priority as any),
        lastReviewedAt: null,
        dueAt: Timestamp.fromDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)), // tomorrow
        lapses: 0,
        sleepFactor: 1.0,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        // Keep reference to client task
        clientTaskId: taskId,
        subject: clientTask?.subject || "",
        subTasks: clientTask?.subTasks || [],
      };
      
      await adminTaskRef.set(initialTask);
    }

    // Process the review with SM-18 algorithm
    const result = await reviewTaskWithGrade({
      uid,
      taskId,
      grade,
    });

    // Update the client-side task with SM-18 data for UI consistency
    if (result.ok) {
      const adminTaskData = await adminTaskRef.get();
      const adminTask = adminTaskData.data();
      
      if (adminTask) {
        const clientUpdates = {
          // Keep SM-18 fields in sync
          stability: adminTask.stability,
          difficulty: adminTask.difficulty,
          retrievability: adminTask.retrievability,
          priorityWeight: adminTask.priorityWeight,
          lastReviewedAt: adminTask.lastReviewedAt?.toDate().toISOString(),
          dueAt: adminTask.dueAt?.toDate().toISOString(),
          lapses: adminTask.lapses,
          sleepFactor: adminTask.sleepFactor,
          updatedAt: adminTask.updatedAt?.toDate().toISOString(),
          
          // Update the user rating
          userRating: grade,
          
          // Update the due date string for client compatibility
          dueDate: adminTask.dueAt?.toDate().toISOString().split('T')[0], // YYYY-MM-DD format
          
          // Normalize priority format
          priority: adminTask.priority || "medium",
        };

        await clientTaskRef.update(clientUpdates);
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Task review error:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message ?? "Unknown error occurred" 
    }, { status: 500 });
  }
}
