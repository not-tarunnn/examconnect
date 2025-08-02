'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuth from './useAuth';

interface UserData {
  fullName?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  uid: string;
}

export default function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            fullName: data.fullName || user.displayName || '',
            username: data.username || '',
            email: data.email || user.email || '',
            profilePicture: data.profilePicture || data.profilePic || user.photoURL || '',
            uid: user.uid
          });
        } else {
          // Fallback to Firebase Auth data if no Firestore document
          setUserData({
            fullName: user.displayName || '',
            username: '',
            email: user.email || '',
            profilePicture: user.photoURL || '',
            uid: user.uid
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to Firebase Auth data on error
        setUserData({
          fullName: user.displayName || '',
          username: '',
          email: user.email || '',
          profilePicture: user.photoURL || '',
          uid: user.uid
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { userData, loading };
}
