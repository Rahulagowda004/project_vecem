import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

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

export const sendChatMessage = async (message: string, uid: string) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      uid,
      session_id: null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to send chat message");
  }

  return response.json();
};
