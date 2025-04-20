import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { sendFirebaseUidAndEmail } from "../services/uploadService";
import config from "../config"; // Import the config with fallbacks

// Define Firebase config type for TypeScript
type FirebaseConfigType = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

// Use the Firebase configuration from config.ts which includes fallbacks
const firebaseConfig: FirebaseConfigType = config.FIREBASE_CONFIG;

// Log environment variable loading status for debugging
console.log("Firebase config loaded:", {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
  measurementId: !!firebaseConfig.measurementId,
});

// Initialize Firebase without additional validation (already handled in config.ts)
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const googleProvider = new GoogleAuthProvider();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const uid = user.uid;
    const name = user.displayName || "";
    const email = user.email || "";
    console.log("User UID:", uid);
    console.log("User Email:", email);
    console.log("User Name:", name);
    await sendFirebaseUidAndEmail(uid, email, name);
  }
});

console.log("Firebase initialized successfully");

export { auth, firestore, storage, analytics, googleProvider };
export default firebaseConfig;
