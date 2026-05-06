# Firebase Cloud Messaging (FCM) Push Notifications Implementation

This document explains the complete push notification system implemented for ExamConnect.

## Architecture Overview

```
1. User sends message in ChatTab/ChatTabMini
   ↓
2. Message saved to Realtime Database
   ↓
3. Client calls /api/send-notification API route
   ↓
4. Backend fetches sender name & receiver FCM token from Firestore
   ↓
5. Firebase Admin SDK sends FCM notification
   ↓
6a. Foreground: onMessage() handler shows notification
6b. Background: Service worker (firebase-messaging-sw.js) shows notification
   ↓
7. User clicks notification → Opens chat with sender
```

## Components & Files

### 1. API Route: `/api/send-notification/route.ts` ✅ NEW

**Purpose**: Server-side endpoint that sends FCM notifications using Firebase Admin SDK

**Flow**:
- Receives: `senderId`, `receiverId`, `messageText`
- Fetches sender profile from `users/{senderId}`
- Fetches receiver FCM token from `users/{receiverId}`
- Sends notification via Firebase Admin SDK messaging
- Returns 200 even if receiver has no token (graceful fallback)

**Payload sent to FCM**:
```json
{
  "notification": {
    "title": "{senderName} messaged you!",
    "body": "{messageText (truncated to 150 chars)}"
  },
  "data": {
    "senderId": "...",
    "senderName": "...",
    "messageText": "...",
    "timestamp": "..."
  },
  "webpush": {
    "fcmOptions": {
      "link": "/message?uid={senderId}"
    }
  }
}
```

### 2. Message Sending: `ChatTab.tsx` & `ChatTabMini.tsx` ✅ UPDATED

**Changes**:
- After pushing message to Realtime Database
- Calls `/api/send-notification` for each recipient
- For 1:1 DMs: sends to `selectedUser.uid`
- For group chats: sends to all `memberUids` except sender

**Code pattern**:
```typescript
fetch("/api/send-notification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    senderId: user.uid,
    receiverId: selectedUser.uid,
    messageText: input.trim() || "[Image]",
  }),
}).catch((err) => console.error("Failed to send notification:", err));
```

**Fire-and-forget**: Notification sending doesn't block message delivery. Errors are logged but don't affect UX.

### 3. Foreground Handler: `AutoNotification.tsx` ✅ UPDATED

**New**: Added `onMessage()` listener for foreground notifications

**Behavior**:
- When app is open and focused
- FCM sends notification via `onMessage()` callback
- Component shows browser notification using Service Worker API
- Falls back to standard `Notification` if SW unavailable

**Code**:
```typescript
onMessage(messaging, (payload) => {
  const { notification, data } = payload;
  if (notification) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(notification.title, {
        body: notification.body,
        icon: "/favicon.ico",
        data: data,
      });
    });
  }
});
```

### 4. Background Handler: `firebase-messaging-sw.js` ✅ UPDATED

**Purpose**: Service Worker handles notifications when app is closed/minimized

**Handlers**:
1. `messaging.onBackgroundMessage()` - Receives FCM payload and displays notification
2. `notificationclick` event - Handles user clicking notification → opens `/message?uid={senderId}`

**Features**:
- Displays notification with sender name and message preview
- Click opens the exact message thread with that user
- Reuses existing message window if open
- Includes data payload for custom handling

### 5. Token Storage: Already in `AutoNotification.tsx`

**Existing flow** (no changes needed):
1. Request notification permission on first user interaction
2. Get FCM token via `getToken(messaging, { vapidKey: ... })`
3. Store in Firestore: `users/{uid}.fcmToken`
4. Updates on app restart automatically

## Data Model

### Firestore Structure
```
users/{uid}
  ├── fullName: string
  ├── username: string
  ├── profilePic: string
  ├── email: string
  └── fcmToken: string  ← Used to send notifications

messages/{chatId}
  └── (auto-created messages stored in Realtime DB)

groupMessages/{groupId}
  └── (auto-created messages stored in Realtime DB)
```

### Firestore Rules (Recommended)

Ensure users can read FCM tokens only for security:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Environment Variables Required

Add these to your `.env.local`:

```env
# Firebase Client Config (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_VAPID_KEY=...

# Firebase Admin SDK (NEW - REQUIRED)
FIREBASE_ADMIN_SDK_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**How to get `FIREBASE_ADMIN_SDK_KEY`**:
1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Copy the entire JSON and paste as the env variable

## Testing

### 1. Test Token Registration
```typescript
// In browser console on any page
const user = await getAuth().currentUser;
console.log(user);
// Then check Firestore: users/{uid} → should have fcmToken
```

### 2. Test Sending a Message
1. Open two browser windows/tabs
2. Log into each with different accounts
3. In one, send a message to the other
4. Check browser console for notification logs
5. Should see notification appear (if permission granted)

### 3. Test Foreground vs Background
- **Foreground**: App open and focused → `onMessage()` handler
- **Background**: App closed or minimized → Service Worker handles
- **Minimized**: Open DevTools → check Service Worker tab

### 4. Manual API Test
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "user1_uid",
    "receiverId": "user2_uid",
    "messageText": "Test message"
  }'
```

## Troubleshooting

### Notifications not appearing

1. **Check permission**:
   - Browser DevTools → Application → Notifications
   - Should show "granted" or "default" (not denied)
   - If denied: clear site data or reset permission

2. **Check FCM token stored**:
   - Firestore Console → users collection → your user doc
   - Should have `fcmToken` field populated

3. **Check API route error**:
   - Browser Network tab → api/send-notification requests
   - Look for 400/500 status
   - Check server logs for `FIREBASE_ADMIN_SDK_KEY` issues

4. **Check service worker**:
   - DevTools → Application → Service Workers
   - Should show `/firebase-messaging-sw.js` as "activated"
   - If not, hard refresh (Ctrl+Shift+R)

5. **Check Firebase Admin SDK**:
   - Ensure `FIREBASE_ADMIN_SDK_KEY` is set correctly
   - Format must be valid JSON
   - Service account must have Messaging permission

### Tokens not being stored

- Ensure user interacts with page (click, scroll, touch)
- Check browser notifications permission
- Check browser console for errors in `AutoNotification`

### Messages send but notifications don't

- Check if receiver has FCM token in Firestore
- Check API response in Network tab
- Verify sender/receiver UIDs are correct
- Check `FIREBASE_ADMIN_SDK_KEY` validity

## Security Considerations

1. **API Route Protection**: Consider adding authentication check:
   ```typescript
   const token = req.headers.authorization?.split("Bearer ")[1];
   const decoded = await admin.auth().verifyIdToken(token);
   if (decoded.uid !== senderId) return res.status(403).end();
   ```

2. **FCM Token Privacy**: Tokens are stored in Firestore and must not leak
   - Firestore rules restrict token reads to the user themselves
   - API route only sends to the receiver's stored token

3. **Message Content**: Messages are truncated to 150 chars in notification
   - Prevents sensitive data exposure if device is shared
   - Full message only in the app (encrypted at rest if using HTTPS)

4. **Rate Limiting**: Consider adding rate limiting to `/api/send-notification`
   - Prevents notification spam attacks
   - Use middleware like `next-rate-limit`

## Future Enhancements

- Add notification mute/unmute per user
- Track notification delivery status
- Add notification categories (DM vs Group vs Mention)
- Implement notification preferences page
- Add sound/vibration options
- Support rich notifications with images
- Add notification analytics

## References

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://www.w3.org/TR/push-api/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
