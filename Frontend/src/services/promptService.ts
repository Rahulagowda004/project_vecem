const API_URL = "http://127.0.0.1:5000";

export interface PromptData {
  username: string;
  prompt_name: string;
  prompt_description: string;
  prompt: string;
}

export const saveUserPrompt = async (promptData: {
  username: string;
  prompt_name: string;
  prompt: string;
  domain: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...promptData,
        created_at: new Date().toISOString(),
        document_path: `vecem_prompts/${promptData.username}/${promptData.prompt_name}`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save prompt');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
