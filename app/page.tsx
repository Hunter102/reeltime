'use client';

import { useEffect, useState } from 'react';
import { auth } from './utils/firebase'; // Adjust the path if needed
import { User } from 'firebase/auth';
import PhoneLogin from './components/PhoneLogin';
import Home from './components/Home';

export default function Canvas() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => {
          console.log('Service worker registered:', reg);
        })
        .catch((err) => {
          console.error('Service worker registration failed:', err);
        });
    }
  }, []);
  

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      {user ? (
        <div className="text-center">
          <Home/>
        </div>
      ) : (
        <div className="text-center">
          <PhoneLogin />
        </div>
      )}
    </div>
  );
}
