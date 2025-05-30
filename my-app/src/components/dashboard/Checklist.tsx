'use client';

import { useUserStore } from '@/store/useUserStore';
import { updateChecklist, ChecklistItem as FirestoreChecklistItem } from '@/lib/firebase/firestore';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useId } from 'react';
import { Timestamp } from 'firebase/firestore';

// Re-export or redefine ChecklistItem if it's used directly by components
// This ensures consistency with what's stored in Zustand and Firestore.
export type ChecklistItem = FirestoreChecklistItem;


// Zod schema for adding new checklist items
const newItemSchema = z.object({
  text: z.string().min(1, { message: "Item text cannot be empty" }).max(200, { message: "Item text is too long (max 200 chars)" }),
});
type NewItemFormInputs = z.infer<typeof newItemSchema>;


const Checklist = () => {
  const { 
    uid, 
    checklistItems, 
    setChecklist: setStoreChecklist,
    addChecklistItem: addStoreChecklistItem,
    updateChecklistItem: updateStoreChecklistItem,
    removeChecklistItem: removeStoreChecklistItem,
    userDataLoading,
    setUserDataLoading,
    setUserDataError,
    clearUserDataError,
  } = useUserStore((state) => ({
    uid: state.uid,
    checklistItems: state.checklistItems.map(item => ({ // Ensure createdAt is a Date object for sorting
        ...item,
        createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : (item.createdAt || new Date())
    })).sort((a,b) => (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()), // Sort by creation time
    setChecklist: state.setChecklist,
    addChecklistItem: state.addChecklistItem,
    updateChecklistItem: state.updateChecklistItem,
    removeChecklistItem: state.removeChecklistItem,
    userDataLoading: state.userDataLoading,
    setUserDataLoading: state.setUserDataLoading,
    setUserDataError: state.setUserDataError,
    clearUserDataError: state.clearUserDataError,
  }));

  const [formMessage, setFormMessage] = useState<string | null>(null);
  const componentId = useId(); // For unique IDs for form elements

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewItemFormInputs>({
    resolver: zodResolver(newItemSchema),
  });

  // Debounce for Firestore updates
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const saveChecklistToFirestore = (items: ChecklistItem[]) => {
    if (!uid) return;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(async () => {
      setUserDataLoading(true);
      clearUserDataError();
      try {
        // Convert Date back to Timestamp before saving to Firestore
        const firestoreItems = items.map(item => ({
          ...item,
          createdAt: item.createdAt instanceof Date ? Timestamp.fromDate(item.createdAt) : item.createdAt
        }));
        await updateChecklist(uid, firestoreItems);
        // Optionally show a success message or rely on optimistic updates
      } catch (error: any) {
        console.error("Error updating checklist:", error);
        setUserDataError(error.message || "Failed to save checklist.");
        setFormMessage(`Error: ${error.message || "Failed to save checklist."}`);
      } finally {
        setUserDataLoading(false);
      }
    }, 1500); // Debounce for 1.5 seconds
    setDebounceTimeout(newTimeout);
  };
  
  const handleAddItem: SubmitHandler<NewItemFormInputs> = (data) => {
    if (!uid) {
      setUserDataError("User not authenticated.");
      return;
    }
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simple unique ID
      text: data.text,
      completed: false,
      createdAt: Timestamp.now(), // Use Firestore Timestamp initially
    };
    
    addStoreChecklistItem(newItem); // Optimistically update Zustand
    const updatedItems = [...checklistItems, newItem];
    saveChecklistToFirestore(updatedItems);
    reset(); // Reset form
    setFormMessage("Item added!");
    setTimeout(() => setFormMessage(null), 2000);
  };

  const handleToggleItem = (itemId: string) => {
    const itemToToggle = checklistItems.find(item => item.id === itemId);
    if (!itemToToggle) return;
    const updatedItem = { ...itemToToggle, completed: !itemToToggle.completed };
    
    updateStoreChecklistItem(updatedItem); // Optimistic update
    const updatedItems = checklistItems.map(item => item.id === itemId ? updatedItem : item);
    saveChecklistToFirestore(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!uid) return;
    
    removeStoreChecklistItem(itemId); // Optimistic update
    const updatedItems = checklistItems.filter(item => item.id !== itemId);
    saveChecklistToFirestore(updatedItems);
    setFormMessage("Item removed.");
    setTimeout(() => setFormMessage(null), 2000);
  };
  
  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-lg mx-auto">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Custom Checklist</h3>

      {formMessage && (
        <div className={`p-3 mb-3 text-sm rounded-lg ${formMessage.startsWith('Error:') ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
          {formMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleAddItem)} className="flex gap-2 mb-6">
        <input
          type="text"
          {...register('text')}
          placeholder="Add a new checklist item..."
          aria-label="New checklist item"
          id={`${componentId}-newItemText`}
          className={`flex-grow px-3 py-2 border ${errors.text ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        />
        <button
          type="submit"
          disabled={isSubmitting || userDataLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>
      {errors.text && <p className="mt-1 mb-2 text-sm text-red-600">{errors.text.message}</p>}


      {checklistItems.length === 0 && (
        <p className="text-gray-500 text-sm">Your checklist is empty. Add some items above!</p>
      )}

      <ul className="space-y-3">
        {checklistItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`${componentId}-item-${item.id}`}
                checked={item.completed}
                onChange={() => handleToggleItem(item.id)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                aria-labelledby={`${componentId}-item-text-${item.id}`}
              />
              <label 
                htmlFor={`${componentId}-item-${item.id}`}
                id={`${componentId}-item-text-${item.id}`}
                className={`ml-3 block text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}
              >
                {item.text}
              </label>
            </div>
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={userDataLoading}
              className="p-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 disabled:text-gray-400"
              aria-label={`Remove item: ${item.text}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      {userDataLoading && <p className="text-xs text-gray-500 mt-3 text-center">Syncing checklist...</p>}
    </div>
  );
};

export default Checklist;
