import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Your Firebase Firestore instance
import type { Article } from '../contentProvider'; // For typing favorite articles if needed

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp; // To order checklist items
}

export interface UserData {
  uid: string;
  email: string | null; // From auth
  dueDate?: Timestamp | null; // Stored as Firebase Timestamp
  favoriteArticleIds?: string[];
  checklistItems?: ChecklistItem[];
  // Add other user-specific fields here as needed
}

const USER_COLLECTION = 'users';

/**
 * Creates or updates a user's document in Firestore.
 * Typically called upon user registration or first profile update.
 * 
 * @param userId The user's unique ID (from Firebase Auth).
 * @param data Partial data to set for the user.
 */
export async function createUserDocument(userId: string, email: string | null): Promise<void> {
  const userRef = doc(db, USER_COLLECTION, userId);
  const initialData: Partial<UserData> = {
    uid: userId,
    email: email,
    favoriteArticleIds: [],
    checklistItems: [],
    dueDate: null,
  };
  // Use setDoc with merge: true to create if not exists, or merge with existing data.
  // This is useful if you call this function at different points.
  await setDoc(userRef, initialData, { merge: true });
  console.log(`User document created/updated for UID: ${userId}`);
}


/**
 * Fetches a user's data from Firestore.
 * 
 * @param userId The user's unique ID.
 * @returns The user's data or null if not found.
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  if (!userId) {
    console.error("getUserData: userId is undefined or null.");
    return null;
  }
  const userRef = doc(db, USER_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    } else {
      console.log(`No such document for user UID: ${userId}. Attempting to create one.`);
      // If the user is authenticated but has no document, create one.
      // This can happen if a user was created in Auth but writing the doc failed,
      // or for users created before this Firestore logic was in place.
      // We need the email to create the document. This function might not have it.
      // Consider how to get the email if it's critical here.
      // For now, we'll assume that `createUserDocument` is called upon registration/login.
      // If not, this function might need the email as a parameter.
      // await createUserDocument(userId, /* need email here */); 
      // const newDocSnap = await getDoc(userRef);
      // if (newDocSnap.exists()) return newDocSnap.data() as UserData;
      return null; // Or return a default structure
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Saves or updates the user's due date.
 * 
 * @param userId The user's unique ID.
 * @param dueDate The due date (JavaScript Date object).
 */
export async function updateUserDueDate(userId: string, dueDate: Date | null): Promise<void> {
  const userRef = doc(db, USER_COLLECTION, userId);
  try {
    // Convert JS Date to Firebase Timestamp for storing, or null if dueDate is null
    const firebaseDueDate = dueDate ? Timestamp.fromDate(dueDate) : null;
    await updateDoc(userRef, { dueDate: firebaseDueDate });
    console.log(`Due date updated for user ${userId} to ${dueDate?.toISOString()}`);
  } catch (error) {
    console.error("Error updating due date:", error);
    // If the document doesn't exist, updateDoc will fail.
    // Consider using setDoc with merge: true if you want to create it here.
    // await setDoc(userRef, { dueDate: firebaseDueDate }, { merge: true });
    throw error;
  }
}

/**
 * Adds an article ID to the user's list of favorite articles.
 * 
 * @param userId The user's unique ID.
 * @param articleId The ID of the article to add.
 */
export async function addFavoriteArticle(userId: string, articleId: string): Promise<void> {
  const userRef = doc(db, USER_COLLECTION, userId);
  try {
    await updateDoc(userRef, {
      favoriteArticleIds: arrayUnion(articleId)
    });
    console.log(`Article ${articleId} added to favorites for user ${userId}`);
  } catch (error) {
    console.error("Error adding favorite article:", error);
    // Consider setDoc with merge: true if the document or array might not exist.
    // await setDoc(userRef, { favoriteArticleIds: [articleId] }, { merge: true });
    throw error;
  }
}

/**
 * Removes an article ID from the user's list of favorite articles.
 * 
 * @param userId The user's unique ID.
 * @param articleId The ID of the article to remove.
 */
export async function removeFavoriteArticle(userId: string, articleId: string): Promise<void> {
  const userRef = doc(db, USER_COLLECTION, userId);
  try {
    await updateDoc(userRef, {
      favoriteArticleIds: arrayRemove(articleId)
    });
    console.log(`Article ${articleId} removed from favorites for user ${userId}`);
  } catch (error) {
    console.error("Error removing favorite article:", error);
    throw error;
  }
}

/**
 * Updates the user's entire checklist.
 * 
 * @param userId The user's unique ID.
 * @param checklistItems The new array of checklist items.
 */
export async function updateChecklist(userId: string, checklistItems: ChecklistItem[]): Promise<void> {
  const userRef = doc(db, USER_COLLECTION, userId);
  try {
    // Ensure server timestamps are used for new items if not already set
    const itemsWithTimestamps = checklistItems.map(item => ({
      ...item,
      createdAt: item.createdAt || Timestamp.now() 
    }));
    await updateDoc(userRef, { checklistItems: itemsWithTimestamps });
    console.log(`Checklist updated for user ${userId}`);
  } catch (error) {
    console.error("Error updating checklist:", error);
    // Consider setDoc with merge: true if document or field might not exist.
    // await setDoc(userRef, { checklistItems: itemsWithTimestamps }, { merge: true });
    throw error;
  }
}

/*
 Firestore Security Rules (example - to be set up in Firebase Console):

 rules_version = '2';
 service cloud.firestore {
   match /databases/{database}/documents {
     // Users can only read and write their own document in the 'users' collection
     match /users/{userId} {
       allow read, write: if request.auth != null && request.auth.uid == userId;
     }
     // Articles are public read-only for this example
     match /articles/{articleId} {
        allow read: if true;
        allow write: if false; // Or restrict to admin
     }
   }
 }

 Note on User Document Creation:
 It's good practice to create the user document in Firestore when a user first signs up
 or signs in if the document doesn't already exist.
 The `createUserDocument` function is provided for this.
 You can call this from your `initializeAuthStateListener` in `auth.ts`
 when a user is authenticated and their document might need creation.
*/
