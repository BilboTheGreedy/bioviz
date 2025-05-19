import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for API error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data?.detail || error.message || 'An unknown error occurred';
    
    // Show toast notification for errors
    toast.error('API Error', {
      description: message,
    });
    
    return Promise.reject(error);
  }
);