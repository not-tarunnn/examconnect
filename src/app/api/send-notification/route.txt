import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || "{}")
    ),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, messageText } = await request.json();

    // Validate required fields
    if (!senderId || !receiverId || !messageText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch sender name from Firestore
    const senderDoc = await db.collection("users").doc(senderId).get();
    if (!senderDoc.exists) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    const senderData = senderDoc.data();
    const senderName = senderData?.fullName || senderData?.username || senderId;

    // Fetch receiver FCM token from Firestore
    const receiverDoc = await db.collection("users").doc(receiverId).get();
    if (!receiverDoc.exists) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    const receiverData = receiverDoc.data();
    const fcmToken = receiverData?.fcmToken;

    // If receiver has no FCM token, silently return success
    // (they may not have enabled notifications)
    if (!fcmToken) {
      return NextResponse.json(
        { message: "Receiver has no FCM token registered" },
        { status: 200 }
      );
    }

    // Send FCM notification
    const payload = {
      notification: {
        title: `${senderName} messaged you!`,
        body: messageText.substring(0, 150), // Truncate to 150 chars
      },
      data: {
        senderId,
        senderName,
        messageText: messageText.substring(0, 200),
        timestamp: Date.now().toString(),
      },
    };

    await messaging.send({
      token: fcmToken,
      notification: payload.notification,
      data: payload.data,
      webpush: {
        fcmOptions: {
          link: `/message?uid=${senderId}`,
        },
      },
    });

    return NextResponse.json(
      { message: "Notification sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("FCM Error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
