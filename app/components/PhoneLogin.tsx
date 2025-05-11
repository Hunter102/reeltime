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
  const [step, setStep] = useState(0); // Start with step 0
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const router = useRouter();

  const [phoneInput, setPhoneInput] = useState('+1 '); // display value
  const formatPhoneForDisplay = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, ''); // allow only digits and initial +
    const digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;

    let formatted = '+';
    for (let i = 0; i < digits.length && i < 11; i++) {
      if (i === 0) formatted += digits[i] + ' ';
      else if (i === 3 || i === 6) formatted += digits[i] + ' ';
      else formatted += digits[i];
    }

    return formatted.trim();
  };

  const getFirebasePhone = (formattedPhone: string) =>
    formattedPhone.replace(/\s/g, '');

  // ✅ Detect if app is running in standalone (installed) mode
  const [isPWAActive, setIsPWAActive] = useState(false);
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    if (isStandalone) {
      setIsPWAActive(true);
      setStep(1);
    } else {
      setStep(0); // Default to install step if not installed
    }
  }, []);

  // Mobile detection (optional)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window.innerWidth <= 768) { // Example condition for mobile devices
      setIsMobile(true);
    }
  }, []);

  // Install prompt setup
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Prevent the browser from showing the default install prompt
      setDeferredPrompt(e); // Store the event
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Function to trigger the custom install prompt
  const handleInstallClick = () => {
    if (deferredPrompt) {
      console.log("Installing...");
      deferredPrompt.prompt(); // Show the native install prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null); // Clear the prompt after use
      });
    } else {
      console.log("No deferred prompt available");
    }
  };

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
      const rawPhone = getFirebasePhone(phoneInput);
      const result = await signInWithPhoneNumber(auth, rawPhone, window.recaptchaVerifier!);
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

        {step === 0 && !isMobile && (
          <>
            <h2 className="text-2xl font-bold">Install the App</h2>
            <p className="text-sm text-gray-300 mt-2">
              To continue, please install this app by clicking the button below:
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-4"
            >
              Install App
            </button>
          </>
        )}

        {/* Display install instructions on mobile */}
        {step === 0 && isMobile && (
          <>
            <h2 className="text-2xl font-bold">Install the App</h2>
            <p className="text-sm text-gray-300 mt-2">
              To install this app, follow the instructions for your device:
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <strong>iOS:</strong> Tap the share button at the bottom of the screen, then tap "Add to Home Screen."
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <strong>Android:</strong> Tap the three dots in the top-right corner and then select "Add to Home Screen."
            </p>
          </>
        )}

        {/* Step 1: Enter phone */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold">Phone Verification</h2>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(formatPhoneForDisplay(e.target.value))}
              placeholder="+1 234 567 8910"
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

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold">Enter Code</h2>
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

        {/* Step 3: Complete profile */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold">Complete Profile</h2>
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
