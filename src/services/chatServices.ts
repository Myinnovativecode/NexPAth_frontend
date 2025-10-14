// src/services/chatServices.ts
import API_BASE_URL from '../api'; // ✅ Add this import
export const sendMessageToAPI = async (message: string, userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, { // ✅ Changed
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: message, user_id: userId }), // Ensure backend accepts 'query'
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from server.");
    }

    const data = await response.json();

    // If it's a string (error handling fallback), wrap it
    if (typeof data === "string") {
      return { response: data, source: "error" };
    }

    return data; // Should be { response: "...", source: "rasa" }
  } catch (error) {
    console.error("Error in chatService:", error);
    return { response: "Oops! Something went wrong. Please try again.", source: "error" };
  }
};
