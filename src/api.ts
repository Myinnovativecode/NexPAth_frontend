// src/api.ts
import axios from 'axios';

// Prefer the Vite env var; fall back intelligently
const envBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL || // optional secondary name
  '';

const computedFallback =
  typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')
    ? 'https://nexpathbackend-1.onrender.com'    // production fallback
    : 'http://localhost:8000';                    // local dev fallback

const API_BASE_URL = envBase || computedFallback;

// Helpful one-time debug
// console.log('API_BASE_URL:', API_BASE_URL);

export default API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export interface User {
  name: string;
  email: string;
  contact?: string;
}

export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/user/profile/${userId}`);
  return response.data;
};