# User Location and IP Address Logging

## Overview

This feature automatically logs user IP addresses and GPS locations to Firebase Firestore when users authenticate (login/signup). The data is stored in the user's document with timestamps for tracking purposes.

## Implementation Details

### Files Created/Modified

1. **`src/lib/userLocationService.ts`** (NEW)
   - Core service for IP address and location retrieval
   - Functions:
     - `getUserIP()`: Fetches user's public IP address via ipify API
     - `getUserLocation()`: Gets GPS coordinates via Geolocation API
     - `logUserLocationData()`: Logs both IP and location to Firebase
     - `initializeLocationLogging()`: Handles permission checks and orchestrates logging

2. **`src/hooks/useLocationTracking.ts`** (NEW)
   - React hook for periodic location tracking
   - Useful for re-logging location at intervals
   - Accepts custom interval parameter (default: 5 minutes)

3. **`src/app/login/page.tsx`** (MODIFIED)
   - Updated all login methods to call `initializeLocationLogging()` after successful authentication
   - Affected methods:
     - `loginWithGoogle()`
     - `loginWithFacebook()`
     - `loginWithApple()`
     - `loginWithEmail()`
     - `loginAnonymously()`

4. **`src/app/signup/page.tsx`** (MODIFIED)
   - Updated all signup methods to call `initializeLocationLogging()` after successful authentication
   - Affected methods:
     - `signupWithGoogle()`
     - `signupWithFacebook()`
     - `signupWithApple()`
     - `signupWithEmail()`
     - `signupAnonymously()`

## Firebase Schema

Data is stored in the `users` collection with the following structure:

```javascript
{
  uid: "user123",
  email: "user@example.com",
  fullName: "User Name",
  // ... other user fields ...
  
  // New fields for location tracking
  lastIp: {
    ipAddress: "203.0.113.42",
    timestamp: Timestamp
  },
  
  lastLocation: {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 50,  // Accuracy in meters
    timestamp: Timestamp
  },
  
  updatedAt: Timestamp  // When this data was last updated
}
```

## Features

### IP Address Logging
- Uses the free **ipify API** (https://www.ipify.org) to get public IP
- Reliable and doesn't require authentication
- Captures the user's public IP address automatically

### GPS Location Logging
- Uses the **Geolocation API** (browser native)
- Captures:
  - **Latitude**: Precise Y-coordinate
  - **Longitude**: Precise X-coordinate
  - **Accuracy**: Accuracy radius in meters (useful for understanding data quality)
- Requires user permission (browser will prompt on first use)
- Timeout: 10 seconds (won't block authentication if geolocation is slow)
- Uses high accuracy mode for best precision

### Permission Handling
- Checks geolocation permission status before requesting
- If denied by user: only IP address is logged
- If not set: prompts user for permission
- Does not block authentication or user experience
- Gracefully falls back to IP-only logging if geolocation unavailable

### Timestamps
- All data includes `Timestamp.now()` for precise logging
- Allows tracking when each update occurred
- Useful for analyzing user activity patterns

## Usage

### Automatic Logging (Already Implemented)
Location logging happens automatically when:
1. User logs in (any method: Google, Facebook, Apple, Email, Anonymous)
2. User signs up (any method: Google, Facebook, Apple, Email, Anonymous)

No additional code needed from the developer.

### Manual Location Logging

If you need to log location data at other points, import and use:

```typescript
import { initializeLocationLogging } from '@/lib/userLocationService';

// In your component or function
await initializeLocationLogging(userId);
```

### Periodic Location Tracking

To track user location at regular intervals in a component:

```typescript
'use client';

import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function MyComponent() {
  // Track location every 5 minutes
  const { isLogging } = useLocationTracking(5 * 60 * 1000);
  
  return (
    <div>
      {isLogging && <p>Updating location...</p>}
    </div>
  );
}
```

## Privacy Considerations

⚠️ **Important Privacy Notes:**

1. **User Permission**: GPS tracking requires explicit user permission
   - Browser will prompt with a permission dialog
   - Users can deny and the app continues to work (IP only logged)
   - Users can revoke permissions in browser settings

2. **Data Security**: 
   - Location data is stored in Firebase Firestore
   - Ensure proper Firebase security rules are in place
   - Consider encrypting sensitive location data at rest
   - Follow GDPR/privacy regulations if applicable

3. **Transparency**:
   - Users should be informed about location tracking in:
     - Privacy Policy
     - Terms of Service
     - User agreement
   - Consider adding an opt-in/opt-out mechanism

4. **Data Retention**:
   - Currently only stores the latest location
   - Consider implementing data deletion policies
   - Archive old location data if needed for analytics

## Error Handling

The implementation includes comprehensive error handling:

- **IP Fetch Failures**: Silently falls back to location-only logging
- **Geolocation Disabled**: Silently falls back to IP-only logging
- **Timeout**: Uses 10-second timeout to prevent blocking
- **Permission Denied**: Continues with IP logging only
- **Browser Incompatibility**: Gracefully degrades

No errors will prevent user login or authentication flow.

## Browser Compatibility

| Feature | Support |
|---------|---------|
| IP Address (ipify API) | All modern browsers + older browsers |
| Geolocation API | Modern browsers (Chrome, Firefox, Safari, Edge) |
| Permissions API | Modern browsers (check `navigator.permissions`) |

## Monitoring and Analytics

You can query Firestore to analyze user location data:

```javascript
// Get all users with recent location data
db.collection('users')
  .where('lastLocation', '!=', null)
  .orderBy('updatedAt', 'desc')
  .limit(100)
  .get()

// Get users from specific IP
db.collection('users')
  .where('lastIp.ipAddress', '==', '203.0.113.42')
  .get()
```

## Troubleshooting

### Location data not appearing in Firebase

1. **Check browser permissions**: User may have denied geolocation
2. **Check network**: ipify API requires internet connection
3. **Check Firestore rules**: Ensure rules allow writes to user document
4. **Check console**: Look for error messages in browser console
5. **Check Firestore**: Verify user document exists before update

### Permission prompts not appearing

- Permission check may show "denied" from previous session
- Clear browser site data and try again
- Different browsers may have different permission states

### High accuracy not available

- GPS may be unavailable (indoor location, signal loss)
- Accuracy field shows the uncertainty radius in meters
- Fallback locations may use IP-based geolocation

## API References

- **ipify API**: https://www.ipify.org (Free IP detection)
- **Geolocation API**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Firebase Firestore**: https://firebase.google.com/docs/firestore

## Future Enhancements

Possible improvements:

1. **Location History**: Store multiple location entries with timestamps
2. **Geofencing**: Trigger events when users enter/exit regions
3. **Privacy Settings**: Allow users to disable location tracking
4. **Data Visualization**: Dashboard showing user locations on a map
5. **Analytics**: Analyze user distribution and movement patterns
6. **VPN Detection**: Detect if IP doesn't match location
7. **Offline Support**: Queue location updates when offline
8. **Encryption**: End-to-end encryption for sensitive location data
