import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { toast } from 'sonner';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Set persistence to local to ensure session is saved
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

export const signInWithGoogle = async () => {
  console.log("Calling signInWithPopup...");
  try {
    // Force account selection
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    console.log("SignIn Success:", result.user.email);
    return result;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    if (error.code === 'auth/popup-blocked') {
      toast.error("Popup blocked! Please allow popups for this site.");
    } else if (error.code === 'auth/unauthorized-domain') {
      toast.error("This domain is not authorized in Firebase console.");
    } else {
      toast.error(`Login failed: ${error.message}`);
    }
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestPushNotificationPermission = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        // You should add your VAPID key here if you have one
        // vapidKey: 'YOUR_VAPID_KEY'
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};
