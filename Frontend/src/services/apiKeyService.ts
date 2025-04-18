import axios from "axios";
import { API_BASE_URL } from "../config";

export const saveApiKey = async (
  uid: string,
  apiKey: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/save-api-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid, api_key: apiKey }),
  });

  if (!response.ok) {
    throw new Error("Failed to save API key");
  }
};

export const checkApiKey = async (uid: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-api-key/${uid}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to check API key");
    }
    const data = await response.json();
    return Boolean(data.hasKey);
  } catch (error) {
    console.error("API key check error:", error);
    throw error;
  }
};
