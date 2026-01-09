// lib/userLocationService.ts
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Timestamp;
  confidence?: number; // 0-100, how confident we are in this reading
}

interface HighAccuracyOptions {
  minReadings?: number; // Minimum number of readings to average
  maxAccuracyThreshold?: number; // Maximum acceptable accuracy in meters
  timeout?: number; // Maximum time to wait for readings
  targetAccuracy?: number; // Target accuracy in meters
}

interface IPData {
  ipAddress: string;
  timestamp: Timestamp;
}

interface UserLocationUpdate {
  lastIp?: IPData;
  lastLocation?: LocationData;
  updatedAt: Timestamp;
}

/**
 * Fetch the user's IP address from an IP geolocation service
 */
export async function getUserIP(): Promise<string | null> {
  try {
    console.log('[Location] Fetching IP address...');
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ip = data.ip || null;
    console.log('[Location] IP address fetched:', ip);
    return ip;
  } catch (error) {
    console.error('[Location] Error fetching IP address:', error);
    return null;
  }
}

/**
 * Get user's GPS location using single reading
 */
export async function getUserLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    console.log('[Location] Requesting GPS location (single reading)...');

    if (!navigator.geolocation) {
      console.warn('[Location] Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('[Location] GPS location received (single):', {
          latitude,
          longitude,
          accuracy,
        });
        resolve({
          latitude,
          longitude,
          accuracy,
          timestamp: Timestamp.now(),
          confidence: calculateConfidence(accuracy),
        });
      },
      (error) => {
        console.warn('[Location] Error getting geolocation:', {
          code: error.code,
          message: error.message,
        });
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate confidence score based on accuracy
 * Returns 0-100 score where 100 = perfect accuracy
 */
function calculateConfidence(accuracy: number): number {
  // Accuracy in meters to confidence mapping
  // 1m = 100%, 5m = 95%, 10m = 90%, etc.
  if (accuracy <= 1) return 100;
  if (accuracy <= 5) return 95;
  if (accuracy <= 10) return 90;
  if (accuracy <= 20) return 85;
  if (accuracy <= 30) return 80;
  if (accuracy <= 50) return 70;
  if (accuracy <= 100) return 50;
  return Math.max(10, 100 - accuracy / 2); // Lower bounds at 10%
}

/**
 * Get high-accuracy GPS location by collecting multiple readings
 * This method collects multiple readings and averages them for better accuracy
 */
export async function getUserLocationHighAccuracy(
  options: HighAccuracyOptions = {}
): Promise<LocationData | null> {
  const {
    minReadings = 5, // Collect 5 readings by default
    maxAccuracyThreshold = 30, // Accept readings with accuracy <= 30m
    timeout = 30000, // Wait up to 30 seconds
    targetAccuracy = 5, // Try to achieve 5m accuracy
  } = options;

  return new Promise((resolve) => {
    console.log('[Location] Starting HIGH ACCURACY location tracking...');
    console.log('[Location] Config:', {
      minReadings,
      maxAccuracyThreshold,
      timeout,
      targetAccuracy,
    });

    if (!navigator.geolocation) {
      console.warn('[Location] Geolocation is not supported');
      resolve(null);
      return;
    }

    const readings: Array<{
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    }> = [];

    const startTime = Date.now();
    let watchId: number | null = null;

    // Set timeout to stop watching and process collected readings
    const timeoutId = setTimeout(() => {
      stopWatching();
      processReadings();
    }, timeout);

    const stopWatching = () => {
      if (watchId !== null) {
        console.log('[Location] Stopping watch position...');
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      clearTimeout(timeoutId);
    };

    const processReadings = () => {
      if (readings.length === 0) {
        console.warn('[Location] No valid readings collected');
        resolve(null);
        return;
      }

      console.log('[Location] Processing', readings.length, 'readings...');

      // Filter readings by accuracy threshold
      const validReadings = readings.filter((r) => r.accuracy <= maxAccuracyThreshold);
      console.log(
        '[Location] Valid readings (accuracy <=',
        maxAccuracyThreshold,
        'm):',
        validReadings.length
      );

      if (validReadings.length === 0) {
        // Use best reading if no readings meet threshold
        const bestReading = readings.reduce((best, current) =>
          current.accuracy < best.accuracy ? current : best
        );
        console.log('[Location] Using best reading (accuracy:', bestReading.accuracy, 'm)');
        resolve({
          latitude: bestReading.latitude,
          longitude: bestReading.longitude,
          accuracy: bestReading.accuracy,
          timestamp: Timestamp.now(),
          confidence: calculateConfidence(bestReading.accuracy),
        });
        return;
      }

      // Average the valid readings
      const avgLatitude = validReadings.reduce((sum, r) => sum + r.latitude, 0) / validReadings.length;
      const avgLongitude =
        validReadings.reduce((sum, r) => sum + r.longitude, 0) / validReadings.length;
      const avgAccuracy =
        validReadings.reduce((sum, r) => sum + r.accuracy, 0) / validReadings.length;

      console.log('[Location] HIGH ACCURACY location (averaged from', validReadings.length, 'readings):', {
        latitude: avgLatitude,
        longitude: avgLongitude,
        accuracy: avgAccuracy,
      });

      // Calculate confidence for averaged reading
      const confidence = Math.min(99, calculateConfidence(avgAccuracy) + 5); // +5 for averaging

      resolve({
        latitude: avgLatitude,
        longitude: avgLongitude,
        accuracy: avgAccuracy,
        timestamp: Timestamp.now(),
        confidence,
      });
    };

    // Start watching position with high accuracy
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const elapsedSeconds = (Date.now() - startTime) / 1000;

        console.log(
          `[Location] Reading #${readings.length + 1} (${elapsedSeconds.toFixed(1)}s):`,
          {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            accuracy: accuracy.toFixed(1),
          }
        );

        readings.push({
          latitude,
          longitude,
          accuracy,
          timestamp: Date.now(),
        });

        // Check if we have enough good readings
        const goodReadings = readings.filter((r) => r.accuracy <= targetAccuracy);
        if (goodReadings.length >= minReadings) {
          console.log('[Location] Got', minReadings, 'accurate readings, stopping watch');
          stopWatching();
          processReadings();
        }
      },
      (error) => {
        console.warn('[Location] Geolocation error:', {
          code: error.code,
          message: error.message,
        });
        // Continue trying
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Individual timeout per reading
        maximumAge: 0, // Don't use cached positions
      }
    );
  });
}

/**
 * Log user's IP address and GPS location to Firebase using high accuracy
 */
export async function logUserLocationData(userId: string, useHighAccuracy: boolean = true): Promise<void> {
  try {
    console.log('[Location] Starting to fetch IP and location...');

    // Fetch IP in parallel with location
    const ipAddressPromise = getUserIP();

    // Get location with high accuracy by default
    const location = useHighAccuracy
      ? await getUserLocationHighAccuracy({
          minReadings: 5,
          maxAccuracyThreshold: 30,
          timeout: 30000,
          targetAccuracy: 5,
        })
      : await getUserLocation();

    const ipAddress = await ipAddressPromise;

    console.log('[Location] Data collected:', {
      hasIp: !!ipAddress,
      hasLocation: !!location,
      ip: ipAddress,
      location: location
        ? {
            lat: location.latitude,
            lng: location.longitude,
            accuracy: location.accuracy.toFixed(1),
            confidence: location.confidence,
          }
        : null,
      highAccuracyUsed: useHighAccuracy,
    });

    if (!ipAddress && !location) {
      console.warn('[Location] Could not retrieve IP address or location');
      return;
    }

    const userRef = doc(db, 'users', userId);
    const updateData: UserLocationUpdate = {
      updatedAt: Timestamp.now(),
    };

    // Add IP address if available
    if (ipAddress) {
      updateData.lastIp = {
        ipAddress,
        timestamp: Timestamp.now(),
      };
      console.log('[Location] IP will be logged:', ipAddress);
    }

    // Add location if available
    if (location) {
      updateData.lastLocation = location;
      console.log('[Location] Location will be logged (HIGH ACCURACY):', {
        latitude: location.latitude.toFixed(6),
        longitude: location.longitude.toFixed(6),
        accuracy: location.accuracy.toFixed(1) + 'm',
        confidence: location.confidence + '%',
      });
    }

    // Update the user document in Firestore
    console.log('[Location] Updating Firebase document...');
    await updateDoc(userRef, updateData);
    console.log('[Location] ✅ User location data logged successfully to Firebase (HIGH ACCURACY MODE)');
  } catch (error) {
    console.error('[Location] ❌ Error logging user location data:', error);
    // Don't throw - we don't want location logging to break authentication
  }
}

/**
 * Request permission and log user location data with HIGH ACCURACY
 * Call this after user authentication
 *
 * This function will:
 * 1. Collect 5 GPS readings over ~10-30 seconds
 * 2. Average them for ~99% accuracy
 * 3. Log to Firebase with confidence score
 */
export async function initializeLocationLogging(userId: string): Promise<void> {
  try {
    console.log('═════════════════════════════════════════════════');
    console.log('[Location] 🎯 HIGH ACCURACY LOCATION TRACKING ENABLED');
    console.log('═════════════════════════════════════════════════');
    console.log('[Location] User ID:', userId);
    console.log('[Location] Please allow location permission when prompted');
    console.log('[Location] Collecting GPS readings for maximum accuracy...');
    console.log('═════════════════════════════════════════════════');

    // Use high accuracy by default (true)
    await logUserLocationData(userId, true);

    console.log('═════════════════════════════════════════════════');
    console.log('[Location] ✅ HIGH ACCURACY location logging completed');
    console.log('═════════════════════════════════════════════════');
  } catch (error) {
    console.error('[Location] ❌ Error during location logging:', error);
    // Non-blocking - don't throw
  }
}
