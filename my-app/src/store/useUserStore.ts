import {create} from 'zustand';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp
import type { ChecklistItem, UserData } from '@/lib/firebase/firestore'; // Import ChecklistItem

// Helper to convert Firestore Timestamps to Date objects or null
const timestampToDate = (timestamp: Timestamp | undefined | null): Date | null => {
  if (!timestamp) return null;
  return timestamp.toDate();
};

// Helper to convert Date objects to Firestore Timestamps or null
// Not strictly needed in the store if we always convert before sending to Firestore,
// but good to be aware of if we were to store Timestamps directly in store.
// const dateToTimestamp = (date: Date | null): Timestamp | null => {
//   if (!date) return null;
//   return Timestamp.fromDate(date);
// };


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

export const useUserStore = create<UserProfileState>((set, get) => ({
  // Auth state
  uid: null,
  email: null,
  isLoggedIn: false,
  isLoading: true, // Start with loading true until auth state is confirmed
  error: null,
  
  // User profile state (general, e.g. from a separate 'profiles' collection or auth.displayName)
  name: '', 

  // User-specific data from 'users/{uid}' collection
  dueDate: null,
  favoriteArticleIds: [],
  checklistItems: [],
  userDataLoading: false, // Initially false, true when fetching UserData
  userDataError: null,

  // --- AUTH ACTIONS ---
  setUser: (uid, email) => set({ 
    uid, 
    email, 
    isLoggedIn: !!uid, 
    isLoading: false, // Auth loading finished
    error: null 
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearError: () => set({ error: null }),
  
  // --- PROFILE ACTIONS (example) ---
  setName: (name) => set({ name }),

  // --- USER DATA ACTIONS (for data from 'users/{uid}') ---
  setUserData: (data) => {
    const update: Partial<UserProfileState> = {
      favoriteArticleIds: data.favoriteArticleIds || get().favoriteArticleIds,
      checklistItems: data.checklistItems 
        ? data.checklistItems.map(item => ({ // Ensure timestamps are converted if they are Timestamps
            ...item,
            createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : item.createdAt
          }))
        : get().checklistItems,
      dueDate: data.dueDate ? timestampToDate(data.dueDate) : get().dueDate, // Convert Timestamp to Date
      userDataLoading: false,
      userDataError: null,
    };
    if (data.email && !get().email) { // Populate email if not set by auth yet (e.g. from Firestore doc)
        update.email = data.email;
    }
    if (data.uid && !get().uid) { // Populate uid if not set by auth yet
        update.uid = data.uid;
    }
    set(update);
  },
  setUserDataLoading: (loading) => set({ userDataLoading: loading }),
  setUserDataError: (error) => set({ userDataError: error, userDataLoading: false }),
  clearUserDataError: () => set({ userDataError: null }),

  updateDueDate: (newDueDate) => set({ dueDate: newDueDate }),
  
  addFavoriteId: (articleId) => set((state) => ({
    favoriteArticleIds: state.favoriteArticleIds.includes(articleId) 
      ? state.favoriteArticleIds 
      : [...state.favoriteArticleIds, articleId]
  })),
  
  removeFavoriteId: (articleId) => set((state) => ({
    favoriteArticleIds: state.favoriteArticleIds.filter(id => id !== articleId)
  })),
  
  setChecklist: (items) => set({ 
    checklistItems: items.map(item => ({
      ...item,
      // Ensure createdAt is a Date object if it's coming from Firestore as Timestamp
      createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : item.createdAt
    }))
  }),

  addChecklistItem: (item) => {
    const newItem = {
      ...item,
      // Ensure createdAt is a Date object
      createdAt: item.createdAt instanceof Timestamp ? item.createdAt.toDate() : (item.createdAt || new Date())
    };
    set((state) => ({
      checklistItems: [...state.checklistItems, newItem].sort((a, b) => 
        (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
      )
    }));
  },

  updateChecklistItem: (updatedItem) => {
     const newItem = {
      ...updatedItem,
      createdAt: updatedItem.createdAt instanceof Timestamp ? updatedItem.createdAt.toDate() : updatedItem.createdAt
    };
    set((state) => ({
      checklistItems: state.checklistItems.map(item => item.id === newItem.id ? newItem : item)
    }));
  },
  
  removeChecklistItem: (itemId) => set((state) => ({
    checklistItems: state.checklistItems.filter(item => item.id !== itemId)
  })),

}));

// Initialize auth listener when store is created (if not already handled elsewhere)
// This depends on your app structure. If AuthStateInitializer component is used, this might be redundant.
// if (typeof window !== 'undefined') { // Ensure it runs only on client-side
//   useUserStore.getState().setLoading(true); // Set initial loading state
//   initializeAuthStateListener(); 
//   console.log("Zustand store: Auth listener initialization requested.");
// }

// Modify the auth.ts to ensure createUserDocument is called
// when onAuthStateChanged detects a new user for the first time.
// This implies that auth.ts would need to import and use createUserDocument from firestore.ts
// and also potentially call getUserData to populate the store initially.
// This is a structural consideration for how data flows from Firestore to Zustand upon login/registration.
