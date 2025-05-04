interface Config {
  API_BASE_URL: string;
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  ENCRYPTION_KEY: string;
}

// Default API URL that will be used if the environment variable is not set
const DEFAULT_API_URL =
  "https://vecem-fkhdbxcpcrhscmge.centralindia-01.azurewebsites.net";

// Default Firebase configuration values
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCOvJJJ09So-UMX48LPD11Qph5u4kHdY5c",
  authDomain: "vecem-a2b35.firebaseapp.com",
  projectId: "vecem-a2b35",
  storageBucket: "vecem-a2b35.firebasestorage.app",
  messagingSenderId: "1001351785962",
  appId: "1:1001351785962:web:56e302507f3a89aa0e5693",
  measurementId: "G-N2XVLS35MY",
};

// Helper function to access environment variables safely
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  // Check if we're in a browser environment (where import.meta.env would be undefined in older browsers)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }

  // Fallback to window.__ENV__ if defined (can be injected via index.html)
  if (typeof window !== "undefined" && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }

  return defaultValue;
};

// Export the API base URL separately for easier imports
export const API_BASE_URL = getEnvVar("VITE_API_BASE_URL", DEFAULT_API_URL);

// Get Firebase configuration with fallbacks to default values
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY", DEFAULT_FIREBASE_CONFIG.apiKey),
  authDomain: getEnvVar(
    "VITE_FIREBASE_AUTH_DOMAIN",
    DEFAULT_FIREBASE_CONFIG.authDomain
  ),
  projectId: getEnvVar(
    "VITE_FIREBASE_PROJECT_ID",
    DEFAULT_FIREBASE_CONFIG.projectId
  ),
  storageBucket: getEnvVar(
    "VITE_FIREBASE_STORAGE_BUCKET",
    DEFAULT_FIREBASE_CONFIG.storageBucket
  ),
  messagingSenderId: getEnvVar(
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    DEFAULT_FIREBASE_CONFIG.messagingSenderId
  ),
  appId: getEnvVar("VITE_FIREBASE_APP_ID", DEFAULT_FIREBASE_CONFIG.appId),
  measurementId: getEnvVar(
    "VITE_FIREBASE_MEASUREMENT_ID",
    DEFAULT_FIREBASE_CONFIG.measurementId
  ),
};

const config: Config = {
  API_BASE_URL,
  FIREBASE_CONFIG: firebaseConfig,
  ENCRYPTION_KEY: getEnvVar(
    "VITE_ENCRYPTION_KEY",
    "default-key-for-development"
  ),
};

//its working
// Log warnings for missing environment variables in production instead of throwing errors
if (import.meta.env && import.meta.env.PROD) {
  const requiredVars = [
    "VITE_API_BASE_URL",
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_FIREBASE_MEASUREMENT_ID",
    "VITE_ENCRYPTION_KEY",
  ];

  for (const envVar of requiredVars) {
    if (!import.meta.env[envVar]) {
      console.warn(
        `Warning: Missing environment variable: ${envVar}, using fallback value`
      );
    }
  }
}

// Add a global TypeScript declaration for window.__ENV__
declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

export default config;
