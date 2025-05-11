'use client';

import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import { useUserData } from '../hooks/useUserData';
import ProtectedRoute from '../components/ProtectedRoute';

export default function UserProfiles() {
  const router = useRouter();
  const { user, userData, loading } = useUserData(); 

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) return <p className="text-white p-4">Loading...</p>;

  return (
    <ProtectedRoute>
        <div className="min-h-screen flex flex-col justify-between bg-black text-white">
        <main className="flex flex-col items-center justify-center py-12">
            <h1 className="text-3xl font-bold mb-4">Profile</h1>
            {user && userData && (
            <>
                <p className="mb-6 text-lg">
                Phone: <span className="font-mono">{user.phoneNumber}</span>
                </p>
                <p className="mb-6 text-lg">
                Username: <span className="font-mono">{userData.username}</span>
                </p>
                <p className="mb-6 text-lg">
                Display Name: <span className="font-mono">{userData.displayName}</span>
                </p>
            </>
            )}
            <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
            >
            Logout
            </button>
        </main>
        <Footer />
        </div>
    </ProtectedRoute>
  );
}
