'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
// No longer importing shallow
import { signOutUser } from '@/lib/firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AuthStatus = () => {
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Individual selectors for store state
  const email = useUserStore(state => state.email);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const isLoading = useUserStore(state => state.isLoading);
  const error = useUserStore(state => state.error);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (err) {
      console.error("Logout error:", err);
      // Optional: useUserStore.getState().setError("Logout failed. Please try again.");
    }
  };

  // First check: if not client mounted, return null (or placeholder)
  if (!isClientMounted) {
    return null;
  }

  // Second check: Loading state (only after client mount is confirmed)
  if (isLoading && !isLoggedIn) {
    return <div className="text-sm text-gray-500">Loading user status...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="space-x-2">
        <Link href="/login" legacyBehavior>
          <a className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50">
            Login
          </a>
        </Link>
        <Link href="/register" legacyBehavior>
          <a className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
            Register
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 relative">
      {email && <p className="text-sm text-gray-700 hidden sm:block">Welcome, <span className="font-medium">{email.split('@')[0]}</span>!</p>}
      <Link href="/dashboard" legacyBehavior>
        <a className="px-3 py-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Dashboard
        </a>
      </Link>
      <button
        onClick={handleLogout}
        disabled={isLoading} // isLoading here refers to the Zustand store's isLoading
        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition-colors"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 absolute -bottom-5 right-0 whitespace-nowrap">
          Auth Error
        </p>
      )}
    </div>
  );
};

export default AuthStatus;
