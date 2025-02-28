import { getFirestore, collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc, Timestamp, DocumentReference } from 'firebase/firestore';
import { firebaseApp } from 'app';
import { UserProfile, useUserStore } from './userStore';
import { Book, Chapter } from './bookTypes';
import { db } from './firebase-config';

// db is imported from firebase-config.ts

// Using Book and Chapter interfaces from bookTypes.ts

// Check if a user can create a new book based on their subscription
export const canCreateBook = async (userId: string): Promise<{canCreate: boolean; reason?: string}> => {
  const { userProfile } = useUserStore.getState();
  
  if (!userProfile) {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { canCreate: false, reason: 'User profile not found' };
    }
    
    const profile = docSnap.data() as UserProfile;
    
    if (profile.booksRemaining <= 0) {
      return { 
        canCreate: false, 
        reason: `You've reached your limit for this period. Your subscription allows ${profile.subscriptionTier === 'Explorer' ? '1 book' : profile.subscriptionTier === 'Writer' ? '5 books' : profile.subscriptionTier === 'Author' ? '15 books' : 'unlimited books'} per month.` 
      };
    }
    
    return { canCreate: true };
  }
  
  if (userProfile.booksRemaining <= 0) {
    return { 
      canCreate: false, 
      reason: `You've reached your limit for this period. Your subscription allows ${userProfile.subscriptionTier === 'Explorer' ? '1 book' : userProfile.subscriptionTier === 'Writer' ? '5 books' : userProfile.subscriptionTier === 'Author' ? '15 books' : 'unlimited books'} per month.` 
    };
  }
  
  return { canCreate: true };
};

// Update user's book count after creating a book
export const updateUserBookCount = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'userProfiles', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const profile = docSnap.data() as UserProfile;
    
    await updateDoc(docRef, {
      booksCreated: profile.booksCreated + 1,
      booksRemaining: Math.max(0, profile.booksRemaining - 1),
      updatedAt: new Date().toISOString()
    });
    
    // Update the store with the new values
    const userStore = useUserStore.getState();
    if (userStore.userProfile) {
      userStore.updateProfile({
        ...userStore.userProfile,
        booksCreated: profile.booksCreated + 1,
        booksRemaining: Math.max(0, profile.booksRemaining - 1)
      });
    }
  }
};

// Function to reset user's book count at the beginning of each period
export const resetUserBookCount = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'userProfiles', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const profile = docSnap.data() as UserProfile;
    let booksAllowed = 0;
    
    // Set books allowed based on subscription tier
    switch(profile.subscriptionTier.toLowerCase()) {
      case 'explorer':
        booksAllowed = 1;
        break;
      case 'writer':
        booksAllowed = 5;
        break;
      case 'author':
        booksAllowed = 15;
        break;
      case 'publisher':
        booksAllowed = 999; // Effectively unlimited
        break;
      default:
        booksAllowed = 1; // Default to Explorer tier
    }
    
    // Calculate next reset date (1 month from now)
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    
    await updateDoc(docRef, {
      booksRemaining: booksAllowed,
      nextResetDate: nextResetDate.toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};
