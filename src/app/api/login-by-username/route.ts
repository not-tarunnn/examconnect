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
const adminAuth = getAuth(adminApp);

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", username).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const uid = snapshot.docs[0].id;
    const user = await adminAuth.getUser(uid);

    return NextResponse.json({
      uid,
      email: user.email,
    });
  } catch (error) {
    console.error("Error looking up username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
