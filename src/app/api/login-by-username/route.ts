import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";

const apps = getApps();
const adminApp = apps.length === 0
  ? initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || "{}")),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  : getApp();

const db = getFirestore(adminApp);
const auth = getAuth(adminApp);

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Query usernames/{username} to get the uid
    const usernamesRef = db.collection("usernames");
    const usernameDoc = await usernamesRef.doc(username).get();

    if (!usernameDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const data = usernameDoc.data();
    const uid = data?.uid;

    if (!uid) {
      return NextResponse.json(
        { error: "Invalid username record" },
        { status: 400 }
      );
    }

    // Get email from Firebase Auth using uid
    const authUser = await auth.getUser(uid);
    const email = authUser.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found in auth" },
        { status: 400 }
      );
    }

    return NextResponse.json({ uid, email });
  } catch (error) {
    console.error("Error looking up username:", error);
    return NextResponse.json(
      { error: "Failed to lookup username. Please try again." },
      { status: 500 }
    );
  }
}
