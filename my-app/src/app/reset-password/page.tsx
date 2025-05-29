'use client';

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import AuthStateInitializer from '@/components/auth/AuthStateInitializer'; // To ensure listener is active
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function ResetPasswordPage() {
  const { isLoggedIn, isLoading } = useUserStore(state => ({ isLoggedIn: state.isLoggedIn, isLoading: state.isLoading }));
  const router = useRouter();

  useEffect(() => {
    // It's generally okay for logged-in users to access password reset,
    // but you could redirect if desired.
    // if (isLoggedIn && !isLoading) {
    //   router.push('/'); 
    // }
  }, [isLoggedIn, isLoading, router]);
  
  if (isLoading && !isLoggedIn) { // Show loading only if not logged in, to avoid flicker if page is accessed directly
     return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <AuthStateInitializer />
      <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
           <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link href="/login" legacyBehavior>
              <a className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Login here
              </a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
