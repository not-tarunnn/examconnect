// src/app/api/tasks/[taskId]/review/route.ts
import { NextResponse } from "next/server";
import { reviewTaskWithGrade } from "@/lib/sm18-task";
import { adminAuth } from "@/lib/firebaseAdmin";

/**
 * POST /api/tasks/[taskId]/review
 *
 * Expected JSON body:
 *  { uid?: string, grade: number }
 *
 * Preferred auth: provide Firebase ID token in Authorization header:
 *  Authorization: Bearer <idToken>
 *
 * If no token is provided, the endpoint will accept uid in the body (less secure).
 */

export async function POST(req: Request, { params }: { params: { taskId?: string } }) {
  try {
    const taskId = params?.taskId;
    if (!taskId) {
      return NextResponse.json({ ok: false, error: "Missing taskId in URL" }, { status: 400 });
    }

    // Parse JSON body defensively (handle non-JSON responses gracefully)
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      // If req.json() fails, try reading text for better error messages
      const text = await req.text();
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
      }
    }

    const rawGrade = body?.grade;
    const grade = typeof rawGrade === "number" ? rawGrade : Number(rawGrade);
    if (!Number.isFinite(grade) || grade < 1 || grade > 5) {
      return NextResponse.json({ ok: false, error: "grade must be a number between 1 and 5" }, { status: 400 });
    }

    // Determine UID: prefer verified ID token in Authorization header
    let uid: string | undefined;
    const authHeader = (req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "").trim();

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (!token) {
        return NextResponse.json({ ok: false, error: "Bearer token empty" }, { status: 401 });
      }
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        uid = decoded.uid;
      } catch (err) {
        console.error("Token verification failed:", err);
        return NextResponse.json({ ok: false, error: "Invalid or expired auth token" }, { status: 401 });
      }
    } else if (body?.uid) {
      // Fallback — client supplied uid in request body (less secure)
      uid = body.uid;
      console.warn("Warning: review route used uid from body. Prefer passing an ID token in Authorization header.");
    } else {
      return NextResponse.json(
        { ok: false, error: "Authentication required. Provide a Bearer ID token or include uid in body." },
        { status: 401 }
      );
    }

    // Run the algorithm (server-side) — this function should update Firestore and write history
   if (!uid) {
  return NextResponse.json({ ok: false, error: "No uid resolved" }, { status: 401 });
}

const result = await reviewTaskWithGrade({ uid, taskId, grade });


    // Ensure we always return a JSON payload
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("/api/tasks/[taskId]/review error:", err);
    const message = err?.message ?? "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
