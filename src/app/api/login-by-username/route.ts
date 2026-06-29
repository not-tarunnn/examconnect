import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const apps = getApps();
const adminApp = apps.length === 0
  ? initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || "{}")),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  : getApp();

const db = getFirestore(adminApp);

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Query users collection where username field matches
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", username).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userDoc = snapshot.docs[0];
    const uid = userDoc.id;
    const userData = userDoc.data();

    // Return UID and email from Firestore document
    return NextResponse.json({
      uid,
      email: userData.email || null,
    });
  } catch (error) {
    console.error("Error looking up username:", error);
    return NextResponse.json(
      { error: "Failed to lookup username. Please try again." },
      { status: 500 }
    );
  }
}
