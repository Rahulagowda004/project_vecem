import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { sendFirebaseUidAndEmail } from "../services/uploadService"; // Import the updated function

const firebaseConfig = {
  apiKey: "AIzaSyCOvJJJ09So-UMX48LPD11Qph5u4kHdY5c",
  authDomain: "vecem-a2b35.firebaseapp.com",
  projectId: "vecem-a2b35",
  storageBucket: "vecem-a2b35.firebasestorage.app",
  messagingSenderId: "1001351785962",
  appId: "1:1001351785962:web:56e302507f3a89aa0e5693",
  measurementId: "G-N2XVLS35MY",
};

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
    await sendFirebaseUidAndEmail(uid, email, name); // Send UID and email to backend
  }
});

console.log("Firebase initialized successfully");

export { auth, firestore, storage, analytics, googleProvider };
export default firebaseConfig;
