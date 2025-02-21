import { firestore } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface UserData {
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  displayName?: string;
  photoURL?: string;
}

export const createUserDocument = async (
  userId: string, 
  userData: UserData
) => {
  try {
    await setDoc(doc(firestore, 'users', userId), {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const updateUserData = async (
  userId: string, 
  data: Partial<UserData>
) => {
  try {
    await updateDoc(doc(firestore, 'users', userId), {
      ...data,
      lastLogin: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
