'use client';

import { useEffect, useRef } from 'react';
import { initializeAuthStateListener, unsubscribeFromAuth } from '@/lib/firebase/auth';
import { useUserStore } from '@/store/useUserStore';

/**
 * This component is responsible for initializing the Firebase authentication state listener
 * when the application loads. It should be placed at a high level in the component tree,
 * typically in the root layout, to ensure it runs once on app startup.
 */
const AuthStateInitializer = () => {
  const listenerInitialized = useRef(false);
  // Accessing Zustand store to potentially trigger re-renders if needed,
  // though its primary role here is to ensure the listener is set up.
  const { setLoading } = useUserStore.getState();


  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Ensure the listener is only initialized once.
    // The `useRef` hook helps maintain this state across re-renders without causing re-initialization.
    if (!listenerInitialized.current) {
      setLoading(true); // Set initial loading state
      unsubscribe = initializeAuthStateListener();
      listenerInitialized.current = true;
      console.log('AuthStateInitializer: Firebase auth listener started.');
    }

    // Cleanup function: Unsubscribe when the component unmounts
    // or if the app were to "shut down" the listener explicitly.
    return () => {
      if (unsubscribe) {
        console.log('AuthStateInitializer: Cleaning up Firebase auth listener.');
        unsubscribe();
      }
      // Optionally, you could also call the more explicit unsubscribeFromAuth()
      // if it handles global state or other refs that need resetting.
      // unsubscribeFromAuth(); 
      // listenerInitialized.current = false; // Reset if you want it to re-init if component remounts after unmount
    };
  }, [setLoading]); // Effect dependencies

  return null; // This component does not render anything
};

export default AuthStateInitializer;
