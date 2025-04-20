'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../utils/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function PhoneLogin() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA solved'),
      });
      window.recaptchaVerifier.render().catch(console.error);
    }
  }, []);

  const sendCode = async () => {
    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier!);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      console.error('Error sending OTP:', err);
    }
  };

  const verifyCode = async () => {
    try {
      const result = await confirmationResult?.confirm(code);
      if (!result) return;

      const user = result.user;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        router.push('/');
      } else {
        setStep(3); // go to profile setup
      }
    } catch (err) {
      console.error('Error verifying code:', err);
    }
  };

  const completeSignup = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, {
        phoneNumber: user.phoneNumber,
        username,
        displayName,
        createdAt: serverTimestamp(),
      });

      router.push('/');
    } catch (err) {
      console.error('Error saving user data:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full space-y-6">
        <div id="recaptcha-container" />

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold">Step 1: Phone Verification</h2>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-2 text-white rounded"
            />
            <button
              onClick={sendCode}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold">Step 2: Enter OTP</h2>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter OTP code"
              className="w-full px-4 py-2 text-white rounded"
            />
            <button
              onClick={verifyCode}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Verify Code
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold">Step 3: Complete Profile</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2 text-white rounded"
            />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="w-full px-4 py-2 text-white rounded mt-2"
            />
            <button
              onClick={completeSignup}
              className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mt-4"
            >
              Finish Signup
            </button>
          </>
        )}
      </div>
    </div>
  );
}
