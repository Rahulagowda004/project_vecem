import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { sendFirebaseUidAndEmail } from "../services/uploadService";

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

// Use environment variables directly for Firebase configuration
const firebaseConfig: FirebaseConfigType = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Log environment variable loading status for debugging
console.log("Firebase config environment variables loaded:", {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
  measurementId: !!firebaseConfig.measurementId,
});

// Validate required Firebase configuration
const requiredConfig = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

// Type-safe check for missing config
const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key]);
if (missingConfig.length > 0) {
  console.error("Missing Firebase configuration:", missingConfig);
  throw new Error(
    `Missing required Firebase configuration: ${missingConfig.join(", ")}`
  );
}

// Initialize Firebase
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
