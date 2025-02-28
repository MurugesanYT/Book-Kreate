import { create } from 'zustand';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from 'app';
import { db } from './firebase-config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  subscriptionTier: string;
  booksCreated: number;
  booksRemaining: number;
  nextResetDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface UserState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: (uid: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  resetError: () => void;
}

// db is imported from firebase-config.ts

export const useUserStore = create<UserState>((set, get) => ({
  userProfile: null,
  isLoading: false,
  error: null,

  fetchUserProfile: async (uid: string) => {
    // Make sure we have a valid UID
    if (!uid) {
      console.error('No UID provided for fetchUserProfile');
      set({ error: 'No user ID available', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      // Attempt to get existing profile
      const docRef = doc(db, 'userProfiles', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Document exists, set it to the store
        const profileData = docSnap.data() as UserProfile;
        console.log('Loaded profile:', profileData);
        set({ userProfile: profileData, isLoading: false });
      } else {
        // Get the current user's email from Firebase Auth
        const auth = getAuth(firebaseApp);
        const currentUser = auth.currentUser;
        
        // Document doesn't exist, create a new profile with default subscription (Explorer)
        const defaultProfile: UserProfile = {
          uid,
          email: currentUser?.email || '',
          subscriptionTier: 'Explorer',
          booksCreated: 0,
          booksRemaining: 1, // Free tier allows 1 book per month
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nextResetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString() // Reset in one month
        };

        // Create the profile in Firestore
        await setDoc(docRef, defaultProfile);
        set({ userProfile: defaultProfile, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ error: 'Failed to fetch user profile', isLoading: false });
    }
  },

  updateProfile: async (profile: UserProfile) => {
    set({ isLoading: true, error: null });
    try {
      // Update the updatedAt timestamp
      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString()
      };

      // Update the profile in Firestore
      const docRef = doc(db, 'userProfiles', profile.uid);
      await setDoc(docRef, updatedProfile, { merge: true });

      // Update the local state
      set({ userProfile: updatedProfile, isLoading: false });
    } catch (error) {
      console.error('Error updating user profile:', error);
      set({ error: 'Failed to update user profile', isLoading: false });
    }
  },

  resetError: () => set({ error: null })
}));

// Helper function to subscribe to a user's profile changes
export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  const docRef = doc(db, 'userProfiles', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserProfile);
    }
  });
};
