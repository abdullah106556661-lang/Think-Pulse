import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot per Firebase skill guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or configuration requires network sync.');
    }
  }
}
testFirestoreConnection();

/**
 * Sign in with Google Auth
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    // Sync user document to Firestore
    const userDocRef = doc(firestore, 'users', fbUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    const isMasterAdmin = fbUser.email === 'abdullah106556661@gmail.com';
    const role = isMasterAdmin ? 'admin' : 'user';
    const plan = isMasterAdmin ? 'premium' : 'pro';

    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'ThinkPulse Explorer',
        photoURL: fbUser.photoURL || '',
        role,
        plan,
        tokensUsed: 0,
        tokensRemaining: isMasterAdmin ? 999999999 : 500000,
        unlimited: isMasterAdmin,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userDocRef, {
        lastLoginAt: new Date().toISOString(),
      });
    }

    return fbUser;
  } catch (err: any) {
    console.error('Google Sign-In error:', err);
    throw err;
  }
}

/**
 * Sign out user
 */
export async function signOutFirebaseUser() {
  await signOut(auth);
}

/**
 * Save project to Firestore
 */
export async function saveProjectToFirestore(project: {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  slug: string;
  code: string;
  liveUrl?: string;
  isDeployed?: boolean;
}) {
  try {
    const projectRef = doc(firestore, 'projects', project.id);
    await setDoc(projectRef, {
      ...project,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not save project to Firestore:', err);
  }
}

/**
 * Fetch projects for user from Firestore
 */
export async function fetchUserProjectsFromFirestore(userId: string) {
  try {
    const q = query(collection(firestore, 'projects'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const projects: any[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });
    return projects;
  } catch (err) {
    console.warn('Failed to fetch user projects from Firestore:', err);
    return [];
  }
}

/**
 * Save generation record to Firestore
 */
export async function saveGenerationToFirestore(generation: {
  id: string;
  userId: string;
  tool: 'chat' | 'image' | 'video' | 'music' | 'transcribe' | 'builder';
  prompt: string;
  modelUsed?: string;
  status: 'success' | 'failed' | 'processing';
  resultUrl?: string;
}) {
  try {
    const genRef = doc(firestore, 'generations', generation.id);
    await setDoc(genRef, {
      ...generation,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not record generation in Firestore:', err);
  }
}
