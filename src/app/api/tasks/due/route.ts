// app/api/tasks/due/route.ts
import { NextResponse } from "next/server";
import { getTasksDueForReview, getPrioritizedTasksForUser, bulkSyncTasksToClient } from "@/lib/sm18-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    const action = searchParams.get('action') || 'due'; // 'due' | 'prioritized'
    const limit = parseInt(searchParams.get('limit') || '10');
    const sync = searchParams.get('sync') === 'true'; // Whether to sync to client
    
    if (!uid) {
      return NextResponse.json({ ok: false, error: "uid required" }, { status: 400 });
    }

    let tasks: any[] = [];
    
    if (action === 'due') {
      tasks = await getTasksDueForReview(uid);
    } else if (action === 'prioritized') {
      tasks = await getPrioritizedTasksForUser(uid, limit);
    } else {
      return NextResponse.json({ ok: false, error: "Invalid action. Use 'due' or 'prioritized'" }, { status: 400 });
    }

    // Optionally sync the tasks back to client Firestore for UI consistency
    if (sync && tasks.length > 0) {
      const taskIds = tasks.map(t => t.id);
      const syncResult = await bulkSyncTasksToClient(uid, taskIds);
      
      return NextResponse.json({
        ok: true,
        tasks,
        sync: syncResult,
        count: tasks.length,
      });
    }

    return NextResponse.json({
      ok: true,
      tasks,
      count: tasks.length,
    });
  } catch (err: any) {
    console.error("Error fetching due tasks:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message ?? "Unknown error occurred" 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { uid, taskIds, action } = await req.json();
    
    if (!uid) {
      return NextResponse.json({ ok: false, error: "uid required" }, { status: 400 });
    }

    if (action === 'sync') {
      if (!taskIds || !Array.isArray(taskIds)) {
        return NextResponse.json({ ok: false, error: "taskIds array required for sync action" }, { status: 400 });
      }
      
      const result = await bulkSyncTasksToClient(uid, taskIds);
      return NextResponse.json({
        ok: true,
        ...result,
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error processing tasks:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message ?? "Unknown error occurred" 
    }, { status: 500 });
  }
}
