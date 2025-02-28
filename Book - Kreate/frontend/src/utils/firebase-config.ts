import { firebaseApp } from "app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Initialize Firestore with settings
export const db = getFirestore(firebaseApp);

// Enable offline persistence when possible
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.log('Persistence not supported by this browser');
    }
  });
} catch (err) {
  console.error('Error enabling persistence:', err);
}

// This file serves as a central place to configure Firebase
// and can be extended with other Firebase services as needed