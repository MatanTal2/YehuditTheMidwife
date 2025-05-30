'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailPassword } from '@/lib/firebase/auth';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }), // Firebase handles actual password checks
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { isLoading, error, clearError, isLoggedIn } = useUserStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError,
    isLoggedIn: state.isLoggedIn,
  }));

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    clearError();
    await signInWithEmailPassword(data.email, data.password);
    // The global auth listener will update the user state.
    // If successful, isLoggedIn will become true, and a redirect can happen
    // from a parent component or via useEffect watching isLoggedIn.
  };
  
  // Example of redirecting if already logged in, can be handled by parent page too
  // useEffect(() => {
  //   if (isLoggedIn) {
  //     router.push('/profile'); // or some other protected route
  //   }
  // }, [isLoggedIn, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 bg-white shadow-xl rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800">Login to your Account</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
       {isLoggedIn && (
         <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <span className="font-medium">Successfully logged in!</span>
        </div>
      )}


      <div>
        <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email-login"
          type="email"
          {...register('email')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password-login"
          type="password"
          {...register('password')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link href="/reset-password" legacyBehavior>
            <a className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isLoggedIn} // Disable if already logged in
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        No account?{' '}
        <Link href="/register" legacyBehavior>
          <a className="font-medium text-indigo-600 hover:text-indigo-500">
            Register here
          </a>
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
