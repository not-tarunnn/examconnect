# FCM Push Notifications - Setup Checklist

## What's Been Implemented ✅

- [x] API route: `/api/send-notification/route.ts` - Backend to send FCM notifications
- [x] Message sending integration: `ChatTab.tsx` & `ChatTabMini.tsx` - Calls API after sending message
- [x] Foreground handler: `AutoNotification.tsx` - Shows notifications when app is open
- [x] Background handler: `firebase-messaging-sw.js` - Shows notifications when app is closed
- [x] Notification click: Opens chat with the sender when user clicks notification
- [x] Firebase client config: Already set up with messaging support

## What You Need To Do

### 1. Set Firebase Admin SDK Key (REQUIRED)

This is the **critical missing piece**. The API route needs this to send notifications.

**Steps**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **⚙️ Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key** button
6. Save the downloaded JSON file safely

**Add to environment**:
- Copy the entire JSON content from the downloaded file
- Go to [Open Settings](#open-settings) in the UI
- Add this environment variable:
  ```
  FIREBASE_ADMIN_SDK_KEY = (paste entire JSON here)
  ```

⚠️ **Important**: This is a secret key. Never commit it or share publicly.

### 2. Verify Environment Variables

Make sure you have these in your `.env.local` or settings:

**Client (already set up)**:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_VAPID_KEY`

**Server (NEW)**:
- `FIREBASE_ADMIN_SDK_KEY` ← This is what you're adding

### 3. Test the Implementation

#### Test 1: Token Registration
1. Open the app and interact with it (click, scroll, etc.)
2. Accept notification permission when prompted
3. Go to Firebase Console → Firestore → users collection
4. Find your user document
5. Should see `fcmToken` field populated

**Expected**: `fcmToken` appears in your user document

#### Test 2: Send a Message
1. Open two different browsers (or incognito + normal)
2. Log in as two different users
3. Go to `/message` page in both
4. Send a message from User A to User B
5. User B should see a notification

**Expected**: Notification appears on User B's device

#### Test 3: Notification Click
1. Click on the notification
2. Should navigate to `/message?uid={senderUid}`
3. Chat thread with sender should open

**Expected**: Chat opens with the sender

### 4. Debug Tips

**Check API calls**:
- Open browser DevTools → Network tab
- Send a message
- Look for `api/send-notification` request
- Check status code (should be 200)
- Check response (should see success message)

**Check service worker**:
- DevTools → Application → Service Workers
- Should show `/firebase-messaging-sw.js` as "activated"
- If red/error: hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Check console errors**:
- DevTools → Console
- Look for red error messages
- Most common: Missing `FIREBASE_ADMIN_SDK_KEY`

**Check Firestore**:
- Firebase Console → Firestore → users
- Find your user by UID
- Verify `fcmToken` exists
- Check if it's a long string (not empty)

## How It Works (Quick Overview)

```
User sends message
    ↓
Message saved to Realtime DB
    ↓
ChatTab calls /api/send-notification
    ↓
API fetches sender name & receiver token from Firestore
    ↓
Firebase Admin SDK sends FCM notification
    ↓
Receiver gets notification:
  - Foreground (app open): onMessage() shows it
  - Background (app closed): Service Worker shows it
    ↓
User clicks → Opens chat with sender
```

## Firestore Security Rules (Recommended)

After testing, update your Firestore rules to restrict FCM token access:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

This ensures:
- Users can't read other users' FCM tokens
- Users can only write their own profile
- API route still works (authenticated via Admin SDK)

## Common Issues & Solutions

### Issue: Notifications not appearing
**Solution**: Check you've set `FIREBASE_ADMIN_SDK_KEY` correctly

### Issue: "Missing required fields" error
**Solution**: Verify `senderId`, `receiverId`, `messageText` are all provided

### Issue: "Receiver not found" error
**Solution**: User document doesn't exist. Ensure user completed signup.

### Issue: "Receiver has no FCM token registered"
**Solution**: Receiver hasn't granted notification permission yet. Ask them to interact with app and accept permission prompt.

### Issue: Service worker not activating
**Solution**: Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)

## Next Steps

1. **Get Firebase Admin SDK Key** from Firebase Console
2. **Add it to environment settings**
3. **Test notification registration** (check Firestore)
4. **Send a test message** between two accounts
5. **Verify notification appears**
6. **Click notification** to verify navigation

Once all tests pass, you have a working FCM notification system! 🎉

## Files Modified

- `src/app/api/send-notification/route.ts` (NEW)
- `src/components/message/ChatTab.tsx` (notification calls added)
- `src/components/message/ChatTabMini.tsx` (notification calls added)
- `src/components/AutoNotification.tsx` (foreground handler added)
- `public/firebase-messaging-sw.js` (click handler added)

All other files remain unchanged.
