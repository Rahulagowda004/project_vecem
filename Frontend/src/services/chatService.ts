const API_URL = "http://127.0.0.1:5000";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export const sendChatMessage = async (
  message: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
};
