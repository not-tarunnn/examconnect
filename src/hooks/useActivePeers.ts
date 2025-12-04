'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateAgeFromDOB } from '@/lib/ageUtils';
import useAuth from './useAuth';

export type ActivePeer = {
  id: string;
  name: string;
  age?: number;
  gender: 'male' | 'female';
  countryFlag: string;
  avatar?: string;
  username?: string;
  lastActive?: number;
};

const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'UK': '🇬🇧',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'IN': '🇮🇳',
  'PH': '🇵🇭',
  'BR': '🇧🇷',
  'MX': '🇲🇽',
  'FR': '🇫🇷',
  'DE': '🇩🇪',
  'JP': '🇯🇵',
  'CN': '🇨🇳',
  'KR': '🇰🇷',
};

const getCountryFlagFromUsername = (username: string): string => {
  // Try to extract country code from username if present
  const countryMatch = username.match(/\b([A-Z]{2})\b/);
  if (countryMatch && COUNTRY_FLAGS[countryMatch[1]]) {
    return COUNTRY_FLAGS[countryMatch[1]];
  }
  return '🌍'; // Default world flag
};

const estimateAgeFromUsername = (username: string): number | undefined => {
  // Try to extract age from username if present
  const ageMatch = username.match(/\d{2}/);
  if (ageMatch) {
    const age = parseInt(ageMatch[0]);
    if (age >= 15 && age <= 80) {
      return age;
    }
  }
  return undefined;
};

const estimateGender = (fullName: string, username: string): 'male' | 'female' => {
  const nameUpper = (fullName + ' ' + username).toUpperCase();
  
  // Female indicators
  const femaleNames = ['ISHA', 'MAYA', 'PRIYA', 'ANANYA', 'SOFIA', 'EMMA', 'OLIVIA', 'AVA', 'ISLA', 'AMELIA'];
  for (const name of femaleNames) {
    if (nameUpper.includes(name)) return 'female';
  }
  
  // Male indicators
  const maleNames = ['ARJUN', 'ROHAN', 'LIAM', 'NOAH', 'ETHAN', 'ADITYA', 'RAHUL', 'VIKRAM', 'AMIT'];
  for (const name of maleNames) {
    if (nameUpper.includes(name)) return 'male';
  }
  
  // Default to male if cannot determine
  return 'male';
};

export default function useActivePeers() {
  const { user } = useAuth();
  const [peers, setPeers] = useState<ActivePeer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setPeers([]);
      setLoading(false);
      return;
    }

    const fetchActivePeers = async () => {
      try {
        setLoading(true);
        const now = Date.now();
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

        // Query for users with lastActive in the last 24 hours
        const q = query(
          collection(db, 'users'),
          where('lastActive', '>=', Timestamp.fromMillis(twentyFourHoursAgo))
        );

        const querySnapshot = await getDocs(q);
        const activePeers: ActivePeer[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const uid = doc.id;

          // Skip current user
          if (uid === user.uid) return;

          const fullName = data.fullName || data.username || uid;
          const username = data.username || '';
          const countryFlag = data.country ? COUNTRY_FLAGS[data.country] || '🌍' : getCountryFlagFromUsername(username);

          // Priority: DOB > stored age > estimate from username
          let age: number | undefined;
          if (data.dateOfBirth || data.dob) {
            age = calculateAgeFromDOB(data.dateOfBirth || data.dob);
          }
          if (!age) {
            age = data.age;
          }
          if (!age) {
            age = estimateAgeFromUsername(username);
          }

          const gender = data.gender || estimateGender(fullName, username);

          activePeers.push({
            id: uid,
            name: fullName,
            age,
            gender,
            countryFlag,
            avatar: data.profilePic || data.profilePicture || undefined,
            username,
            lastActive: data.lastActive?.toMillis?.() || Date.now(),
          });
        });

        // Sort by lastActive (most recently active first)
        activePeers.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));

        setPeers(activePeers);
        setError(null);
      } catch (err) {
        console.error('Error fetching active peers:', err);
        setError('Failed to load peers');
        setPeers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePeers();
  }, [user?.uid]);

  return { peers, loading, error };
}
