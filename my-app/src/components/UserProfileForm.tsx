'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

interface IFormInput {
  name: string;
  email: string;
}

const UserProfileForm = () => {
  const { name, email, setName, setEmail } = useUserStore();
  const { register, handleSubmit, setValue } = useForm<IFormInput>();

  useEffect(() => {
    // Initialize form with store data
    setValue('name', name);
    setValue('email', email);
  }, [name, email, setValue]);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setName(data.name);
    setEmail(data.email);
    console.log('Form data submitted:', data);
    // Here you would typically send data to a server
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Update Profile
      </button>
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Current Store Values:</h3>
        <p className="text-sm text-gray-600">Name: {name}</p>
        <p className="text-sm text-gray-600">Email: {email}</p>
      </div>
    </form>
  );
};

export default UserProfileForm;
