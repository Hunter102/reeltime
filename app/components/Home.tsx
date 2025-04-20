// app/home/page.tsx
'use client';

import ProtectedRoute from '../components/ProtectedRoute';
import Footer from '../components/Footer';
import { User } from 'firebase/auth';
// import Header from '../components/Header';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-black text-white font-[var(--font-geist-sans)]">
        {/* <Header /> */}
        <main className="px-6 py-8 max-w-4xl mx-auto">
          {/* Your protected content here */}
          <h1 className="text-2xl font-bold mb-4">Welcome to Home</h1>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
