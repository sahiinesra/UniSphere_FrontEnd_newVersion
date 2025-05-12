import axios from 'axios';
import { Platform } from 'react-native';
import { storageService } from './storage';

// Define API URL based on platform
// Use localhost for iOS simulator, 10.0.2.2 for Android emulator, or actual IP for physical devices
const getBaseUrl = () => {
  if (__DEV__) {
    // Your actual machine's IP address that's accessible from your device
    const localIP = '192.168.0.31'; // Your actual IP address
    
    return Platform.OS === 'android' 
      ? `http://10.0.2.2:8080/api/v1`        // Android emulator
      : `http://${localIP}:8080/api/v1`;     // iOS simulator and physical devices - use direct IP
  }
  // Production URL - replace with your actual API URL when deploying
  return 'https://your-production-api.com/api/v1';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to add auth token if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error setting auth header:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 response and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Handle token refresh or logout logic here
      await storageService.clearAuthData();
      
      // You could navigate to login screen here, but we'll let the component handle it
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Get API base URL for debugging
  getApiBaseUrl: () => getBaseUrl(),
  
  // Login user
  login: async (email: string, password: string) => {
    const apiUrl = api.defaults.baseURL + '/auth/login';
    console.log(`Attempting POST to: ${apiUrl}`);
    console.log('Login attempt with email:', email, 'and password:', password);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      if (response.data.token) {
        await storageService.setAuthToken(response.data.token);
        if (response.data.user) {
          await storageService.setUserData(response.data.user);
        }
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register user
  register: async (userData: {
    departmentId: number,
    email: string,
    firstName: string,
    lastName: string,
    password: string
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const token = await storageService.getAuthToken();
      return !!token;
    } catch (error) {
      console.error('Token check error:', error);
      return false;
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      return await storageService.getUserData();
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await storageService.clearAuthData();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
};

export default api; 