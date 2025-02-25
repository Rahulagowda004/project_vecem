import { firestore } from "../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import axios from "axios";

const API_URL = "http://localhost:5000";

interface UserData {
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  githubUrl?: string;
  profilePicture?: string;
  datasets?: Array<{
    id: string;
    name: string;
    description: string;
    visibility?: string;
    updatedAt?: string;
  }>;
}

export const createUserDocument = async (
  userId: string,
  userData: UserData
) => {
  try {
    await setDoc(doc(firestore, "users", userId), {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateUserData = async (
  userId: string,
  data: Partial<UserData>
) => {
  try {
    await updateDoc(doc(firestore, "users", userId), {
      ...data,
      lastLogin: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const deleteUserDocument = async (userId: string) => {
  try {
    await deleteDoc(doc(firestore, "users", userId));
  } catch (error) {
    console.error("Error deleting user document:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfileData> => {
  try {
    const response = await axios.get(`${API_URL}/user-profile/${uid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail || "Failed to fetch user profile"
      );
    }
    throw error;
  }
};
