import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, Firestore, Unsubscribe } from 'firebase/firestore';
import { UserProfile, ResourceLink, Category } from '../types';

// Read config from Vite environment variables or default to configured project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAOcOp25MzafswnPzpEDghvunrVS7-umJs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mynhien-14e83.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mynhien-14e83',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mynhien-14e83.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '405377675752',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:405377675752:web:4e2a847b7c4d61e3e9b45d',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }
}

export { auth, db };

export async function loginWithGoogle(): Promise<UserProfile | null> {
  if (!auth) {
    throw new Error('Firebase chưa được khởi tạo.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Giáo viên Khối 2',
    photoURL: user.photoURL,
  };
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Giáo viên Khối 2',
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
}

// Global shared collection & document path in Firestore
const SHARED_DOC_PATH = { collection: 'shared_vault', id: 'khoi_2_resources' };

// Direct Cloud Sync to shared Firestore database (Works directly with rules allow read, write: if true)
export async function syncSharedDataToFirestore(
  data: { links: ResourceLink[]; categories: Category[] }
): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, SHARED_DOC_PATH.collection, SHARED_DOC_PATH.id);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error syncing shared data to Firestore:', err);
    return false;
  }
}

// Fetch shared data from Firestore with safe structure validation
export async function fetchSharedDataFromFirestore(): Promise<{ links: ResourceLink[]; categories: Category[] } | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, SHARED_DOC_PATH.collection, SHARED_DOC_PATH.id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const validLinks = Array.isArray(data.links) ? data.links : [];
      const validCategories = Array.isArray(data.categories) ? data.categories : [];
      return {
        links: validLinks,
        categories: validCategories,
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching shared data from Firestore:', err);
    return null;
  }
}

// Subscribe to real-time changes in shared Firestore database with strict data safety
export function subscribeToSharedFirestore(
  callback: (data: { links: ResourceLink[]; categories: Category[] }) => void
): Unsubscribe {
  if (!db) {
    return () => {};
  }
  try {
    const docRef = doc(db, SHARED_DOC_PATH.collection, SHARED_DOC_PATH.id);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.links) && data.links.length > 0) {
          callback({
            links: data.links,
            categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : [],
          });
        }
      }
    }, (error) => {
      console.warn('Firestore real-time subscription error:', error);
    });
  } catch (err) {
    console.error('Error setting up Firestore listener:', err);
    return () => {};
  }
}

// Test Firestore database connectivity and diagnose permission issues
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  status: 'connected' | 'permission_denied' | 'error' | 'not_configured';
  message: string;
  projectId: string;
}> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      status: 'not_configured',
      message: 'Firebase chưa được khởi tạo cấu hình.',
      projectId: firebaseConfig.projectId || '',
    };
  }

  try {
    const docRef = doc(db, 'system_health', 'ping');
    await setDoc(docRef, {
      lastPing: new Date().toISOString(),
      app: 'TaiNguyenKhoiHai',
    }, { merge: true });
    
    return {
      success: true,
      status: 'connected',
      message: 'Đã kết nối thành công với cơ sở dữ liệu Firebase (' + firebaseConfig.projectId + ')',
      projectId: firebaseConfig.projectId,
    };
  } catch (err: any) {
    console.error('Database connection test failed:', err);
    const code = err?.code || '';
    if (code === 'permission-denied' || (err?.message && err.message.includes('permission'))) {
      return {
        success: false,
        status: 'permission_denied',
        message: 'Lỗi phân quyền (Rules): Firebase đang chặn quyền ghi. Vui lòng đổi rules thành allow read, write: if true; trên Firebase Console.',
        projectId: firebaseConfig.projectId,
      };
    }
    return {
      success: false,
      status: 'error',
      message: 'Không thể kết nối đến Firebase: ' + (err?.message || 'Lỗi mạng hoặc cấu hình'),
      projectId: firebaseConfig.projectId,
    };
  }
}

// Sync user data to Firestore
export async function syncUserDataToFirestore(
  userId: string,
  data: { links: ResourceLink[]; categories: Category[] }
): Promise<boolean> {
  if (!db || !userId) return false;
  try {
    const userDocRef = doc(db, 'teacher_vaults', userId);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error syncing to Firestore:', err);
    return false;
  }
}

// Fetch user data from Firestore
export async function fetchUserDataFromFirestore(
  userId: string
): Promise<{ links: ResourceLink[]; categories: Category[] } | null> {
  if (!db || !userId) return null;
  try {
    const userDocRef = doc(db, 'teacher_vaults', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as { links: ResourceLink[]; categories: Category[] };
    }
    return null;
  } catch (err) {
    console.error('Error loading from Firestore:', err);
    return null;
  }
}

