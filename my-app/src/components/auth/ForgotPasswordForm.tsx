'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendPasswordReset } from '@/lib/firebase/auth';
import { useUserStore } from '@/store/useUserStore'; // For global loading/error, though not strictly needed here
import { useState } from 'react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  // Using local state for loading/success/error as this form is simpler
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { clearError: clearGlobalError } = useUserStore.getState();


  const { register, handleSubmit, formState: { errors: formErrors } } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    clearGlobalError(); // Clear any global errors
    setError(null);
    setIsLoading(true);
    setIsSubmitted(false);

    const success = await sendPasswordReset(data.email);

    if (success) {
      setIsSubmitted(true);
    } else {
      // The error should be set in the Zustand store by sendPasswordReset
      // but we can also set a local error if needed, or rely on the global one.
      // For now, sendPasswordReset updates the global store. We'll check that.
      // If sendPasswordReset is modified to return error message:
      // setError(returnedError || "An unexpected error occurred.");
      setError(useUserStore.getState().error || "Failed to send reset email. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 bg-white shadow-xl rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800">Reset Your Password</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      {isSubmitted && !error && (
         <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <span className="font-medium">Success!</span> If an account exists for this email, a password reset link has been sent. Please check your inbox.
        </div>
      )}

      <div>
        <label htmlFor="email-reset" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          id="email-reset"
          type="email"
          {...register('email')}
          className={`mt-1 block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          aria-invalid={formErrors.email ? "true" : "false"}
        />
        {formErrors.email && <p className="mt-2 text-sm text-red-600">{formErrors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading || isSubmitted}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
      >
        {isLoading ? 'Sending...' : 'Send Password Reset Email'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        Remembered your password?{' '}
        <Link href="/login" legacyBehavior>
          <a className="font-medium text-indigo-600 hover:text-indigo-500">
            Login here
          </a>
        </Link>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
