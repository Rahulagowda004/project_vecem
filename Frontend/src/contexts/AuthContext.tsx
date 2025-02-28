import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { createUserDocument, updateUserData } from '../utils/userManagement';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string) => Promise<void>; // Update signature
  login: (emailOrUsername: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider mounted'); // Debug log
    let isMounted = true;

    setLoading(true); // Ensure loading is true when starting auth check

    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log('Auth state changed:', user?.email); // Debug log
        if (isMounted) {
          setUser(user);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Auth error:', error); // Debug log
        if (isMounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await createUserDocument(userCredential.user.uid, {
        email,
        createdAt: new Date().toISOString(),
        displayName: email.split('@')[0], // Use email prefix as default displayName
      });

      navigate('/home');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message);
      throw err;
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);
      
      // Update last login time
      await updateUserData(userCredential.user.uid, {
        lastLogin: new Date().toISOString()
      });

      navigate('/home');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  console.log('Auth state:', { user: user?.email, loading, error }); // Debug log

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};