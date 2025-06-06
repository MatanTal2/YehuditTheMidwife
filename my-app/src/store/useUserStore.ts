'use client';
import {create} from 'zustand';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp
import type { ChecklistItem, UserData } from '@/lib/firebase/firestore'; // Import ChecklistItem

// Helper to convert Firestore Timestamps to Date objects or null
const timestampToDate = (timestamp: Timestamp | undefined | null): Date | null => {
  if (!timestamp) return null;
  return timestamp.toDate();
};

interface UserProfileState {
  uid: string | null;
  email: string | null; // from auth
  name: string; // example profile data, might be from a different Firestore doc or part of UserData

  isLoggedIn: boolean;
  isLoading: boolean; // For auth operations and initial data load
  error: string | null;

  // User-specific data from Firestore
  dueDate: Date | null; // Store as JS Date object in Zustand for easier use in components
  favoriteArticleIds: string[];
  checklistItems: ChecklistItem[];
  userDataLoading: boolean; // Separate loading state for user profile data
  userDataError: string | null;

  setUser: (uid: string | null, email: string | null) => void;
  setLoading: (loading: boolean) => void; // For general auth loading
  setError: (error: string | null) => void;
  clearError: () => void;
  setName: (name: string) => void;

  // Actions for user-specific data
  setUserData: (data: Partial<UserData>) => void;
  setUserDataLoading: (loading: boolean) => void;
  setUserDataError: (error: string | null) => void;
  clearUserDataError: () => void;

  updateDueDate: (dueDate: Date | null) => void;
  addFavoriteId: (articleId: string) => void;
  removeFavoriteId: (articleId: string) => void;
  setChecklist: (items: ChecklistItem[]) => void;
  addChecklistItem: (item: ChecklistItem) => void;
  updateChecklistItem: (item: ChecklistItem) => void;
  removeChecklistItem: (itemId: string) => void;
}

const initialState: Omit<UserProfileState, keyof ReturnType<typeof createActions>> = {
  uid: null,
  email: null,
  isLoggedIn: false,
  isLoading: true, // Start with loading true until auth state is confirmed
  error: null,
  name: '',
  dueDate: null,
  favoriteArticleIds: [],
  checklistItems: [],
  userDataLoading: false,
  userDataError: null,
};

// Separating actions for clarity, especially with functional updates
const createActions = (set: (fn: (state: UserProfileState) => UserProfileState) => void, get: () => UserProfileState) => ({
  setUser: (uid: string | null, email: string | null) => set((state) => ({
    ...state,
    uid,
    email,
    isLoggedIn: !!uid,
    isLoading: false,
    error: null
  })),
  setLoading: (loading: boolean) => set((state) => ({ ...state, isLoading: loading })),
  setError: (error: string | null) => set((state) => ({ ...state, error, isLoading: false })),
  clearError: () => set((state) => ({ ...state, error: null })),

  setName: (name: string) => set((state) => ({ ...state, name })),

  setUserData: (data: Partial<UserData>) => set((state) => {
    const currentFavorites = state.favoriteArticleIds;
    const currentChecklist = state.checklistItems;
    const currentDueDate = state.dueDate;

    const update: Partial<UserProfileState> = {
      ...state, // Start with current state
      favoriteArticleIds: data.favoriteArticleIds || currentFavorites,
      checklistItems: data.checklistItems
        ? data.checklistItems.map(item => ({
            ...item,
            createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : item.createdAt
          }))
        : currentChecklist,
      dueDate: data.dueDate ? timestampToDate(data.dueDate) : currentDueDate,
      userDataLoading: false,
      userDataError: null,
    };
    if (data.email && !state.email) {
        update.email = data.email;
    }
    if (data.uid && !state.uid) {
        update.uid = data.uid;
    }
    return update; // Return the new state object
  }),
  setUserDataLoading: (loading: boolean) => set((state) => ({ ...state, userDataLoading: loading })),
  setUserDataError: (error: string | null) => set((state) => ({ ...state, userDataError: error, userDataLoading: false })),
  clearUserDataError: () => set((state) => ({ ...state, userDataError: null })),

  updateDueDate: (newDueDate: Date | null) => set((state) => ({ ...state, dueDate: newDueDate })),

  addFavoriteId: (articleId: string) => set((state) => ({
    ...state,
    favoriteArticleIds: state.favoriteArticleIds.includes(articleId)
      ? state.favoriteArticleIds
      : [...state.favoriteArticleIds, articleId]
  })),

  removeFavoriteId: (articleId: string) => set((state) => ({
    ...state,
    favoriteArticleIds: state.favoriteArticleIds.filter(id => id !== articleId)
  })),

  setChecklist: (items: ChecklistItem[]) => set((state) => ({
    ...state,
    checklistItems: items.map(item => ({
      ...item,
      createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : item.createdAt
    }))
  })),

  addChecklistItem: (item: ChecklistItem) => set((state) => {
    const newItem = {
      ...item,
      createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : (item.createdAt || new Date())
    };
    return {
      ...state,
      checklistItems: [...state.checklistItems, newItem].sort((a, b) =>
        (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
      )
    };
  }),

  updateChecklistItem: (updatedItem: ChecklistItem) => set((state) => {
     const newItem = {
      ...updatedItem,
      createdAt: updatedItem.createdAt instanceof Timestamp ? updatedItem.createdAt.toDate() : updatedItem.createdAt
    };
    return {
      ...state,
      checklistItems: state.checklistItems.map(item => item.id === newItem.id ? newItem : item)
    };
  }),

  removeChecklistItem: (itemId: string) => set((state) => ({
    ...state,
    checklistItems: state.checklistItems.filter(item => item.id !== itemId)
  })),
});

export const useUserStore = create<UserProfileState>((set, get) => ({
  ...initialState,
  ...createActions(set as any, get as any), // Casting set and get as 'any' to simplify type matching for this refactor
}));

// Initialize store only on client side
if (typeof window !== 'undefined') {
  useUserStore.setState(initialState);
}
