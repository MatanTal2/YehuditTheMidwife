'use client';

import LoginForm from '@/components/auth/LoginForm';
import AuthStateInitializer from '@/components/auth/AuthStateInitializer'; // To ensure listener is active
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { isLoggedIn, isLoading } = useUserStore(state => ({ isLoggedIn: state.isLoggedIn, isLoading: state.isLoading }));
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      // Redirect if already logged in and not in an intermediate loading state
      router.push('/'); // Or to a dashboard/profile page
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }
  
  if (isLoggedIn) { // Check again after loading, in case state updated
     return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <p className="text-gray-700">You are already logged in.</p>
        <Link href="/" legacyBehavior><a className="text-indigo-600 hover:underline mt-2">Go to Homepage</a></Link>
      </div>
    );
  }

  return (
    <>
      <AuthStateInitializer />
      <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
