// hooks/useLocationTracking.ts
'use client';

import { useEffect, useState } from 'react';
import { logUserLocationData } from '@/lib/userLocationService';
import useAuth from './useAuth';

/**
 * Hook to periodically log user's location and IP address to Firebase with HIGH ACCURACY
 * Call this in any component that should track user location
 * @param interval - Time interval in milliseconds to log location (default: 10 minutes)
 * @param useHighAccuracy - Use high-accuracy multi-reading method (default: true)
 */
export function useLocationTracking(
  interval: number = 60 * 60 * 1000,
  useHighAccuracy: boolean = true
) {
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogTime, setLastLogTime] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !user.uid) return;

    console.log('[Location] useLocationTracking initialized');
    console.log('[Location] Interval:', interval / 1000, 'seconds');
    console.log('[Location] High Accuracy:', useHighAccuracy);

    // Initial log on mount
    setIsLogging(true);
    logUserLocationData(user.uid, useHighAccuracy)
      .catch(console.error)
      .finally(() => {
        setIsLogging(false);
        setLastLogTime(Date.now());
      });

    // Set up interval for periodic logging
    const intervalId = setInterval(() => {
      console.log('[Location] Periodic update triggered');
      setIsLogging(true);
      logUserLocationData(user.uid, useHighAccuracy)
        .catch(console.error)
        .finally(() => {
          setIsLogging(false);
          setLastLogTime(Date.now());
        });
    }, interval);

    return () => {
      console.log('[Location] Cleaning up location tracking');
      clearInterval(intervalId);
    };
  }, [user, interval, useHighAccuracy]);

  return { isLogging, lastLogTime };
}
