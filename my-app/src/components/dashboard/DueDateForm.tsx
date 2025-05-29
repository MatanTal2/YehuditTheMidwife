'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserStore } from '@/store/useUserStore';
import { updateUserDueDate } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // For type checking if needed, not for direct use in form
import { useEffect, useState } from 'react';

// Zod schema for validation
const dueDateSchema = z.object({
  dueDate: z.date({
    required_error: "Please select a date.",
    invalid_type_error: "That's not a valid date!",
  }).min(new Date(new Date().setDate(new Date().getDate() - 280 - 30)), { message: "Date seems too far in the past."}) // LMP could be ~280 days ago + buffer
    .max(new Date(new Date().setDate(new Date().getDate() + 280 + 90)), { message: "Date seems too far in the future."}), // Due date usually within ~280 days + buffer
});

type DueDateFormInputs = z.infer<typeof dueDateSchema>;

const DueDateForm = () => {
  const { 
    uid, 
    dueDate: currentDueDate, // This is a JS Date object from the store
    updateDueDate: updateStoreDueDate, // Action to update Zustand
    userDataLoading, 
    setUserDataLoading,
    setUserDataError,
    clearUserDataError,
  } = useUserStore((state) => ({
    uid: state.uid,
    dueDate: state.dueDate,
    updateDueDate: state.updateDueDate,
    userDataLoading: state.userDataLoading,
    setUserDataLoading: state.setUserDataLoading,
    setUserDataError: state.setUserDataError,
    clearUserDataError: state.clearUserDataError,
  }));

  const [formMessage, setFormMessage] = useState<string | null>(null);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<DueDateFormInputs>({
    resolver: zodResolver(dueDateSchema),
    defaultValues: {
      dueDate: currentDueDate || undefined, // Initialize with undefined if null
    },
  });

  // Effect to update form when store's due date changes (e.g., fetched from Firestore)
  useEffect(() => {
    if (currentDueDate) {
      setValue('dueDate', currentDueDate);
    } else {
      // Explicitly set to undefined if currentDueDate is null to clear the input
      setValue('dueDate', undefined as any); // react-hook-form might prefer undefined for empty date
    }
  }, [currentDueDate, setValue]);

  const onSubmit: SubmitHandler<DueDateFormInputs> = async (data) => {
    if (!uid) {
      setUserDataError("User not authenticated. Cannot save due date.");
      return;
    }
    clearUserDataError();
    setUserDataLoading(true);
    setFormMessage(null);

    try {
      await updateUserDueDate(uid, data.dueDate); // Send JS Date to Firestore function
      updateStoreDueDate(data.dueDate); // Update Zustand store
      setFormMessage("Due date updated successfully!");
    } catch (error: any) {
      console.error("Error updating due date:", error);
      setUserDataError(error.message || "Failed to update due date.");
      setFormMessage(`Error: ${error.message || "Failed to update due date."}`);
    } finally {
      setUserDataLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-700">
        {currentDueDate ? 'Update Your Due Date' : 'Set Your Due Date'}
      </h3>
      
      {formMessage && (
        <div className={`p-3 text-sm rounded-lg ${formMessage.startsWith('Error:') ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
          {formMessage}
        </div>
      )}

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <input
              type="date"
              id="dueDate"
              onChange={(e) => field.onChange(e.target.valueAsDate)} // valueAsDate returns Date object or null
              // The value needs to be in 'yyyy-MM-dd' format for the date input.
              // If field.value is a Date object, format it. If it's undefined/null, pass empty string.
              value={field.value ? field.value.toISOString().split('T')[0] : ''}
              disabled={isSubmitting || userDataLoading}
              className={`mt-1 block w-full px-3 py-2 border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50`}
            />
          )}
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Select your estimated due date. This will help us personalize your content.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || userDataLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {isSubmitting || userDataLoading ? 'Saving...' : (currentDueDate ? 'Update Due Date' : 'Save Due Date')}
      </button>
    </form>
  );
};

export default DueDateForm;
