import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged, // Renamed to avoid conflict
  User as FirebaseUser, // Type for Firebase user object
} from 'firebase/auth';
import { auth } from './firebaseConfig'; // Your Firebase auth instance
import { useUserStore } from '@/store/useUserStore'; // Zustand store

// --- Main Authentication Functions ---

/**
 * Registers a new user with email and password.
 * Updates the Zustand store on success or error.
 */
export const signUpWithEmailPassword = async (email: string, password: string): Promise<void> => {
  const { setLoading, setError, setUser } = useUserStore.getState();
  setLoading(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // setUser will be called by onAuthStateChanged listener, but you can call it here
    // if you want immediate UI update before the listener fires.
    // setUser(userCredential.user.uid, userCredential.user.email);
    console.log('User signed up:', userCredential.user);
  } catch (error: any) {
    console.error('Error signing up:', error);
    setError(error.message || 'Failed to sign up. Please try again.');
    // Rethrow the error if you want to handle it further in the component
    // throw error; 
  } finally {
    // setLoading(false); // setLoading is handled by setUser or setError
  }
};

/**
 * Signs in an existing user with email and password.
 * Updates the Zustand store on success or error.
 */
export const signInWithEmailPassword = async (email: string, password: string): Promise<void> => {
  const { setLoading, setError, setUser } = useUserStore.getState();
  setLoading(true);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // setUser will be called by onAuthStateChanged listener
    // setUser(userCredential.user.uid, userCredential.user.email);
    console.log('User signed in:', userCredential.user);
  } catch (error: any) {
    console.error('Error signing in:', error);
    setError(error.message || 'Failed to sign in. Check your credentials.');
    // throw error;
  } finally {
    // setLoading(false);
  }
};

/**
 * Sends a password reset email to the given email address.
 * Updates the Zustand store with loading/error states.
 */
export const sendPasswordReset = async (email: string): Promise<boolean> => {
  const { setLoading, setError } = useUserStore.getState();
  setLoading(true);
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent to:', email);
    // Optionally, you can set a success message in your store or rely on UI feedback
    setLoading(false); // Explicitly set loading false here as there's no setUser call
    return true;
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    setError(error.message || 'Failed to send password reset email.');
    return false;
  }
};

/**
 * Signs out the current user.
 * Updates the Zustand store.
 */
export const signOutUser = async (): Promise<void> => {
  const { setLoading, setError, setUser } = useUserStore.getState();
  setLoading(true);
  try {
    await signOut(auth);
    // setUser(null, null) will be called by onAuthStateChanged listener
    console.log('User signed out');
  } catch (error: any) {
    console.error('Error signing out:', error);
    setError(error.message || 'Failed to sign out.');
  } finally {
    // setLoading(false); // Handled by onAuthStateChanged -> setUser
  }
};

// --- Auth State Listener ---

let unsubscribeAuthListener: (() => void) | null = null;

/**
 * Subscribes to Firebase authentication state changes and updates the Zustand store.
 * This should be called once when the application initializes (e.g., in a root layout or component).
 */
export const initializeAuthStateListener = (): (() => void) => {
  const { setUser, setLoading, setError } = useUserStore.getState();

  // Unsubscribe from any existing listener before starting a new one
  if (unsubscribeAuthListener) {
    unsubscribeAuthListener();
  }

  setLoading(true); // Set loading true when listener starts

  unsubscribeAuthListener = firebaseOnAuthStateChanged(
    auth,
    async (user: FirebaseUser | null) => {
      if (user) {
        console.log('Auth state changed: User is logged in', user.uid);
        // Ensure user document exists and fetch initial data
        const userData = await getUserData(user.uid);
        if (!userData) {
          console.log(`No Firestore document for ${user.uid}, creating one.`);
          await createUserDocument(user.uid, user.email);
          // Optionally, fetch again or assume default state for newly created user
          const newUserDoc = await getUserData(user.uid);
          if (newUserDoc) useUserStore.getState().setUserData(newUserDoc);
        } else {
          useUserStore.getState().setUserData(userData);
        }
        // Set user in store after ensuring Firestore doc and data are handled
        setUser(user.uid, user.email); 
      } else {
        console.log('Auth state changed: User is logged out');
        setUser(null, null); // Clears user data, including from Firestore
        useUserStore.getState().setUserData({ // Clear Firestore-specific data from store
          dueDate: undefined, // Using undefined to signal it should be reset to initial state or null
          favoriteArticleIds: [],
          checklistItems: [],
        });
      }
      setLoading(false); // Auth loading finished
    },
    (error) => {
      console.error('Error in auth state listener:', error);
      setError(error.message || 'An error occurred with authentication.');
      setLoading(false);
    }
  );
  
  console.log("Firebase auth state listener initialized.");
  return unsubscribeAuthListener;
};

/**
 * Call this function to stop listening to auth state changes, for example, when a user explicitly logs out
 * or when the main application component unmounts, though typically it runs for the app's lifetime.
 */
export const unsubscribeFromAuth = () => {
  if (unsubscribeAuthListener) {
    console.log("Unsubscribing from Firebase auth state changes.");
    unsubscribeAuthListener();
    unsubscribeAuthListener = null; // Reset the variable
  }
};
