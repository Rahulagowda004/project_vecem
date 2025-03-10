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

const API_URL = 'http://127.0.0.1:5000';

export const getPromptDetails = async (username: string, promptName: string) => {
  try {
    const response = await fetch(`${API_URL}/api/prompts/${encodeURIComponent(username)}/${encodeURIComponent(promptName)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.prompt_name || !data.prompt_content) {
      throw new Error('Invalid prompt data received');
    }
    
    return {
      prompt_name: data.prompt_name,
      domain: data.domain || 'General',
      prompt: data.prompt_content,
      description: data.prompt_description || '',
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error fetching prompt details:', error);
    throw error;
  }
};

export const logPromptClick = async (uid: string, promptName: string) => {
  try {
    const response = await fetch(`${API_URL}/prompt-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, promptName }),
      credentials: 'include', // Add this to handle cookies if needed
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to log prompt click');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging prompt click:', error);
    throw error;
  }
};
