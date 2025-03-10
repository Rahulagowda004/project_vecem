const API_URL = "http://127.0.0.1:5000";

export interface PromptData {
  username: string;
  prompt_name: string;
  prompt_description: string;
  prompt: string;
}

export const saveUserPrompt = async (promptData: PromptData) => {
  try {
    const response = await fetch(`${API_URL}/prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promptData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving prompt:", error);
    throw error;
  }
};
