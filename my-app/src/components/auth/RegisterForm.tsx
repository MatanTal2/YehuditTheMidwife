'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUpWithEmailPassword } from '@/lib/firebase/auth';
import { useUserStore } from '@/store/useUserStore';
import { useState } from 'react';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // path of error
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { isLoading, error, clearError } = useUserStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError,
  }));
  const [isSubmitted, setIsSubmitted] = useState(false);


  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    clearError(); // Clear previous errors
    setIsSubmitted(false);
    await signUpWithEmailPassword(data.email, data.password);
    // The global auth listener will update the user state.
    // Check for errors in the store after the async call.
    // For this form, we can set a local state to show a "check your email" or success message.
    setIsSubmitted(true); 
    // No explicit navigation here, relying on global state to change UI if needed,
    // or a parent component could redirect based on isLoggedIn status.
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 bg-white shadow-xl rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800">Create your Account</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      {isSubmitted && !error && !isLoading && (
         <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <span className="font-medium">Registration successful!</span> You can now log in.
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
         <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long.</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          aria-invalid={errors.confirmPassword ? "true" : "false"}
        />
        {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
