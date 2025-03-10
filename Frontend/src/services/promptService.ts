import { API_BASE_URL } from "../config";

export interface PromptData {
  username: string;
  prompt_name: string;
  prompt_description: string; // Added to match backend model
  prompt: string;
}

export const saveUserPrompt = async (promptData: PromptData): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promptData),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save prompt");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in saveUserPrompt:", error);
    throw error;
  }
};
