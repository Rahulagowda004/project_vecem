import { firestore } from "../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

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
  username: string;
  datasets: Array<{
    id: string;
    name: string;
    description: string;
    dataType: "raw" | "vectorized" | "both";
    updatedAt: string;
    upload_type: string; // Add this line
  }>;
}

// Add new function to get profile by username
export const getUserProfileByUsername = async (username: string) => {
  try {
    const response = await fetch(
      `${API_URL}/user-profile/username/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    if (!data) {
      throw new Error("No data received from server");
    }

    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

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

export const getUserProfile = async (uid: string) => {
  try {
    const response = await fetch(`${API_URL}/user-profile/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getUserProfileByUid = async (uid: string) => {
  try {
    const response = await fetch(`${API_URL}/user-profile/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const registerUser = async (
  uid: string,
  email: string,
  name: string
) => {
  try {
    const response = await fetch(`${API_URL}/register-uid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, email, name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: {
  uid: string;
  displayName?: string;
  about?: string;
  photoURL?: string;
  githubUrl?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const checkUsernameAvailability = async (username: string) => {
  try {
    const response = await fetch(`${API_URL}/check-username/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Error checking username availability:", error);
    throw error;
  }
};

export const deleteAccount = async (uid: string) => {
  try {
    const response = await fetch(`${API_URL}/delete-account/${uid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete account");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

export const getUserPrompts = async (uid: string) => {
  try {
    const response = await fetch(`${API_URL}/user-profile/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to fetch prompts: ${response.status}`
      );
    }

    const data = await response.json();
    return data.prompts || [];
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch user prompts"
    );
  }
};

export const deletePrompt = async (promptId: string) => {
  try {
    const response = await fetch(`${API_URL}/prompts/${promptId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete prompt");
    }

    return true;
  } catch (error) {
    console.error("Error deleting prompt:", error);
    throw error;
  }
};
