import axios from 'axios';

// Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Export the base URL so other components can use it
export default API_BASE_URL;

// Define user interface
export interface User {
  name: string;
  email: string;
  contact?: string;
}

// API client setup
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Function to fetch user profile
export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/user/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};