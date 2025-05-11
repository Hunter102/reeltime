'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null); // For additional user data from Firestore
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage for saved user data
    const savedUser = localStorage.getItem('user');
    const savedUserData = localStorage.getItem('userData');

    if (savedUser && savedUserData) {
      setUser(JSON.parse(savedUser)); // Set user from localStorage
      setUserData(JSON.parse(savedUserData)); // Set additional user data from localStorage
      setLoading(false);
    } else {
      // If no user data in localStorage, fetch from Firebase
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const fetchedUserData = userSnap.data();
            setUserData(fetchedUserData);

            // Store both user and userData in localStorage
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('userData', JSON.stringify(fetchedUserData));
          } else {
            console.log("No user data found in Firestore!");
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  return { user, userData, loading };
};
