# FCM Testing Guide with Examples

## Browser Console Tests

### Test 1: Check Firebase Config
```javascript
// In browser console (any page)
import { app } from "@/lib/firebase";
console.log(app.config);
// Should show all Firebase config values
```

### Test 2: Check Current User
```javascript
// In browser console on any authenticated page
import { getAuth } from "firebase/auth";
const auth = getAuth();
console.log(auth.currentUser);
// Should show: uid, email, displayName, etc.
```

### Test 3: Check FCM Token
```javascript
// In browser console
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";

const token = await getToken(messaging, {
  vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
});
console.log("FCM Token:", token);
// Should print a long token string
```

### Test 4: Check Firestore Token Storage
```javascript
// In browser console
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const auth = getAuth();
const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
console.log(userDoc.data().fcmToken);
// Should match the token from Test 3
```

### Test 5: Manually Call Notification API
```javascript
// In browser console
const response = await fetch("/api/send-notification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    senderId: "USER_A_UID",
    receiverId: "USER_B_UID",
    messageText: "Test notification message"
  }),
});
const result = await response.json();
console.log(result);
// Should show: { message: "Notification sent successfully" }
```

## curl / Command Line Tests

### Test 6: API Health Check (no auth)
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "test",
    "receiverId": "test",
    "messageText": "test"
  }'
```

Expected response if Admin SDK key is missing:
```json
{ "error": "Failed to send notification" }
```

Expected response if everything is set up:
```json
{ "message": "Notification sent successfully" }
```

### Test 7: Real Test with Actual Users
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "rKj9pLmN4qRsT5uVwXyZ2abc",
    "receiverId": "aBcD1234EfGhIjKlMnOpQrSt",
    "messageText": "Hello from curl test!"
  }'
```

Replace the UIDs with actual user IDs from your Firebase project.

## Step-by-Step Manual Test

### Scenario: User A sends message to User B

#### Prerequisites
- Two user accounts created in Firebase Auth
- Both users have completed signup (have docs in Firestore users collection)
- Both have visited the app and accepted notification permission

#### Steps

1. **Open User A's session**
   ```
   Open browser 1 → Log in as User A
   Go to /message page
   ```

2. **Open User B's session**
   ```
   Open browser 2 (or incognito) → Log in as User B
   Go to /message page
   ```

3. **User A sends message to User B**
   ```
   In browser 1: Search for User B and start chat
   Type: "Hello User B, this is a test"
   Click Send
   ```

4. **Check Network tab (in browser 1)**
   - Open DevTools → Network tab
   - Send message again
   - Look for `api/send-notification` request
   - Status should be 200
   - Response should be: `{"message":"Notification sent successfully"}`

5. **Check for notification (in browser 2)**
   - If app is open: Notification appears immediately
   - If app is closed: Check OS notification panel
   - Expected: "User A messaged you!" with message text

6. **Click notification**
   - Click the notification
   - Browser 2 should navigate to `/message?uid={userAUid}`
   - Chat thread with User A should be visible

7. **Verify in Firestore (optional)**
   - Go to Firebase Console → Firestore
   - users collection → User B doc
   - Should see `fcmToken: "very_long_string"`
   - Timestamp of last update

## Debugging Network Issues

### Check Request/Response in DevTools

1. Open DevTools → Network tab
2. Send a message
3. Find the `api/send-notification` request
4. Click it to view details:

**Request Tab** (what was sent):
```json
{
  "senderId": "abc123",
  "receiverId": "def456",
  "messageText": "Test message"
}
```

**Response Tab** (what came back):
- Success: `{ "message": "Notification sent successfully" }`
- No token: `{ "message": "Receiver has no FCM token registered" }`
- Error: `{ "error": "Failed to send notification" }` + 500 status

**Headers Tab**:
- Check `Content-Type: application/json`
- Check response status is 200

## Firebase Console Debugging

### Check Admin SDK Key
1. Go to Firebase Console
2. Settings → Service Accounts
3. Copy the service account email
4. Should be something like: `firebase-adminsdk-xyz@project.iam.gserviceaccount.com`

### Check Firestore Rules
1. Go to Firestore Database
2. Rules tab
3. Verify Admin SDK can access user documents
   - Admin SDK always has full read/write access
   - This is fine for backend APIs

### Check Cloud Messaging Settings
1. Go to Cloud Messaging tab
2. Note the Sender ID (same as `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`)
3. Verify VAPID key is configured

## Performance Testing

### Test High Volume Notifications
```javascript
// Send 10 test notifications sequentially
for (let i = 0; i < 10; i++) {
  await fetch("/api/send-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: "user_a_uid",
      receiverId: "user_b_uid",
      messageText: `Test message ${i + 1}`
    }),
  });
  console.log(`Sent notification ${i + 1}`);
}
```

Expected: All complete in < 5 seconds

### Test Group Notifications
```javascript
// In ChatTabMini/ChatTab, send message to group with 5 members
// Should see 5 api/send-notification calls (one per member except sender)
```

Expected: 4 notification requests (5 members - 1 sender)

## Common Test Scenarios

### Scenario A: Token Not Stored
**Symptoms**: 
- Notification API returns 200
- But "Receiver has no FCM token registered"

**Debug**:
1. Check Firestore users/{receiverId}
2. Should have `fcmToken` field
3. If missing: Receiver needs to accept notification permission
4. Click around app to trigger permission prompt

**Solution**: Ask receiver to interact with app and accept permission

### Scenario B: API Returns 500 Error
**Symptoms**:
- Network tab shows /api/send-notification returning 500
- No notification appears

**Debug**:
1. Check server logs for error message
2. Most likely: `FIREBASE_ADMIN_SDK_KEY` not set or invalid
3. Check it's valid JSON
4. Restart dev server after setting env var

**Solution**: Verify FIREBASE_ADMIN_SDK_KEY is correct

### Scenario C: Notification Appears But Wrong User
**Symptoms**:
- Notification says "User X messaged you" 
- But it was actually User Y

**Debug**:
1. Check senderId in API call
2. Check senderName is fetched from correct user doc
3. Check Firestore: users/{senderId} → fullName/username

**Solution**: Ensure senderId is correct in message send call

### Scenario D: Notification Click Doesn't Navigate
**Symptoms**:
- Notification appears and can click
- But doesn't navigate to /message?uid=...

**Debug**:
1. Check Service Worker is active (DevTools → Application → Service Workers)
2. Check `notificationclick` event listener in firebase-messaging-sw.js
3. Check senderId is included in notification data

**Solution**: Hard refresh (Ctrl+Shift+R) to update service worker

## Testing Tools

### VSCode REST Client Extension
```http
### Send Notification
POST http://localhost:3000/api/send-notification
Content-Type: application/json

{
  "senderId": "rKj9pLmN4qRsT5uVwXyZ2abc",
  "receiverId": "aBcD1234EfGhIjKlMnOpQrSt",
  "messageText": "Test from VSCode REST Client"
}
```

### Postman Collection
Create a collection with:
- POST `/api/send-notification`
- Body: JSON with senderId, receiverId, messageText
- Save as preset for quick testing

### Firebase Emulator (Advanced)
```bash
# Start Firebase emulator
firebase emulators:start --only messaging

# Then use emulator URL in tests
```

## Success Checklist

- [ ] FCM token appears in Firestore user doc
- [ ] API endpoint returns 200 status
- [ ] Notification appears when message is sent
- [ ] Notification shows correct sender name
- [ ] Notification preview shows message text
- [ ] Clicking notification opens correct chat
- [ ] Works both in foreground and background
- [ ] Works on multiple devices/browsers
- [ ] Group notifications sent to all members

Once all items are checked, you have a fully working notification system! ✅
