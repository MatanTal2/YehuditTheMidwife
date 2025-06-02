'use client';

import { useState, useEffect } from 'react'; // Added import
import { useUserStore } from '@/store/useUserStore';
import { shallow } from 'zustand/shallow'; // Import shallow
import { signOutUser } from '@/lib/firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Using next/navigation for App Router

const AuthStatus = () => {
  const [isClientMounted, setIsClientMounted] = useState(false); // Added state

  useEffect(() => { // Added effect
    setIsClientMounted(true);
  }, []);

  const { email, isLoggedIn, isLoading, error } = useUserStore(
    (state) => ({
      email: state.email,
      isLoggedIn: state.isLoggedIn,
      isLoading: state.isLoading,
      error: state.error,
    }),
    shallow // Use shallow equality
  );
  const router = useRouter();

  const handleLogout = async () => {
    await signOutUser();
    // The onAuthStateChanged listener will update the store and isLoggedIn state.
    // Redirect to home or login page after logout
    router.push('/'); 
  };

  // Modified if condition
  if (!isClientMounted || (isLoading && !isLoggedIn)) { // Show loading only if not yet logged in, or during logout process, or not yet mounted
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
    <div className="flex items-center space-x-4 relative"> {/* Added relative for error positioning */}
      {email && <p className="text-sm text-gray-700 hidden sm:block">Welcome, <span className="font-medium">{email.split('@')[0]}</span>!</p>}
      <Link href="/dashboard" legacyBehavior>
        <a className="px-3 py-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Dashboard
        </a>
      </Link>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 transition-colors"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 absolute -bottom-5 right-0 whitespace-nowrap">
          {/* Error: {error} - This can be too long. Shorten or make it a tooltip. */}
          Auth Error
        </p>
      )}
    </div>
  );
};

export default AuthStatus;
