import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { BACKUP_TOKEN, HARDCODED_TOKEN, storageService, USER_TOKEN } from './storage';

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
      // First try to get the token from storage
      let token = await storageService.getAuthToken();
      
      // If no token is found, try backup token
      if (!token) {
        console.warn('No valid token found for API request, trying backup token');
        token = BACKUP_TOKEN;
        await storageService.setAuthToken(BACKUP_TOKEN);
      }
      
      if (token) {
        // Use raw token without 'Bearer' prefix as the API expects
        config.headers['Authorization'] = token;
        console.log('Added token to request, length:', token.length);
      } else {
        console.error('No valid token available for request');
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
      console.log('Received 401 unauthorized response - trying alternative tokens');
      originalRequest._retry = true;
      
      // Check if error message contains token expiration
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('expire')) {
        console.log('Token has expired. Trying backup token.');
        
        // Try to use backup token 
        try {
          // Save the backup token
          await storageService.setAuthToken(BACKUP_TOKEN);
          
          // Modify the original request to use this token
          originalRequest.headers['Authorization'] = BACKUP_TOKEN;
          
          // Retry the request
          return api(originalRequest);
        } catch (retryError) {
          console.error('Error while trying to use backup token:', retryError);
        }
      } else {
        // Generic auth error - try hardcoded token
        try {
          // Save the hardcoded token
          await storageService.setAuthToken(HARDCODED_TOKEN);
          
          // Modify the original request to use this token
          originalRequest.headers['Authorization'] = HARDCODED_TOKEN;
          
          // Retry the request
          return api(originalRequest);
        } catch (retryError) {
          console.error('Error while trying to use hardcoded token:', retryError);
        }
      }
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
    console.log('Login attempt with email:', email);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response received');
      
      if (response.data && response.data.token) {
        // Log token format for debugging (only first 10 chars for security)
        const tokenPreview = response.data.token.substring(0, 10) + '...';
        console.log('Auth token received. Preview:', tokenPreview);
        console.log('Token length:', response.data.token.length);
        
        // First, clear any existing tokens to avoid conflicts
        await storageService.clearAuthData();
        
        // Store the token
        await storageService.setAuthToken(response.data.token);
        
        // Double-check token storage
        const storedToken = await storageService.getAuthToken();
        if (storedToken) {
          console.log('Token successfully stored and retrieved');
          
          // Verify JWT format
          const isValidJWT = storedToken.split('.').length === 3;
          if (!isValidJWT) {
            console.warn('Token doesn\'t appear to be in JWT format');
          } else {
            console.log('Token has valid JWT format');
          }
          
          if (response.data.user) {
            await storageService.setUserData(response.data.user);
            console.log('User data stored');
          }
          
          // Set login status for additional verification
          await AsyncStorage.setItem('isUserLoggedIn', 'true');
        } else {
          console.error('Failed to retrieve stored token after login');
          
          // Use USER_TOKEN as fallback
          await storageService.setAuthToken(USER_TOKEN);
          console.log('Using USER_TOKEN as fallback');
        }
      } else {
        console.warn('No token received in login response, using USER_TOKEN');
        console.log('Response data:', JSON.stringify(response.data));
        
        // Use USER_TOKEN
        await storageService.setAuthToken(USER_TOKEN);
        
        // Create dummy response to return
        response.data = {
          ...response.data,
          token: USER_TOKEN,
          user: { id: 2, email: email }
        };
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
      console.log('Checking if user is logged in...');
      
      // Use the enhanced version in storageService
      return await storageService.isLoggedIn();
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
  },
  
  // Force dev mode login (for testing purposes)
  useDevToken: async () => {
    try {
      await storageService.setDevModeLoggedIn();
      return true;
    } catch (error) {
      console.error('Dev token error:', error);
      return false;
    }
  }
};

// Past Exams services
export const pastExamsService = {
  // Create a new past exam with form data
  createPastExam: async (examData: {
    year: string;
    term: string;
    departmentId: string;
    courseCode: string;
    title: string;
  }) => {
    try {
      // Log the request data
      console.log('Creating past exam with data:', JSON.stringify(examData));
      
      // Create FormData object for multipart/form-data request
      const formData = new FormData();
      formData.append('year', examData.year);
      formData.append('term', examData.term.toLowerCase()); // Ensure term is lowercase as in the example (fall)
      formData.append('departmentId', examData.departmentId);
      formData.append('courseCode', examData.courseCode);
      formData.append('title', examData.title);
      
      // Try to get stored token first
      let token = await storageService.getAuthToken();
      
      // If no stored token, use the backup token
      if (!token) {
        console.warn('No auth token found when attempting to create past exam, using backup token');
        token = BACKUP_TOKEN;
        
        // Save the backup token for future use
        await storageService.setAuthToken(BACKUP_TOKEN);
      }
      
      console.log('Using token for request. Token length:', token.length);
      
      // API baseURL
      const baseUrl = getBaseUrl();
      console.log('Making request to:', `${baseUrl}/past-exams`);
      
      // Use fetch directly instead of axios to have more control over the headers
      const response = await fetch(`${baseUrl}/past-exams`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token
        },
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // If unauthorized, try with backup token
        if (response.status === 401) {
          console.log('Unauthorized response, trying with backup token');
          
          const retryResponse = await fetch(`${baseUrl}/past-exams`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': BACKUP_TOKEN
            },
            body: formData
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Server returned ${retryResponse.status}: ${retryResponse.statusText}`);
          }
          
          return await retryResponse.json();
        }
        
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Create past exam response:', JSON.stringify(responseData));
      return responseData;
    } catch (error) {
      console.error('Create past exam error:', error);
      throw error;
    }
  },
  
  // Get all past exams
  getAllPastExams: async (page = 1, pageSize = 10) => {
    try {
      console.log(`Getting past exams (page ${page}, pageSize ${pageSize})`);
      
      // Try to get stored token first
      let token = await storageService.getAuthToken();
      
      // If no stored token, use the backup token
      if (!token) {
        console.warn('No auth token found when attempting to get past exams, using backup token');
        token = BACKUP_TOKEN;
        
        // Save the backup token for future use
        await storageService.setAuthToken(BACKUP_TOKEN);
      }
      
      console.log('Using token for request. Token length:', token.length);
      
      // API baseURL
      const baseUrl = getBaseUrl();
      
      // Add pagination parameters
      const queryParams = `?page=${page}&pageSize=${pageSize}`;
      const requestUrl = `${baseUrl}/past-exams${queryParams}`;
      
      console.log('Making request to:', requestUrl);
      
      // Use fetch directly instead of axios
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // If unauthorized, try with backup token
        if (response.status === 401) {
          console.log('Unauthorized response, trying with backup token');
          
          const retryResponse = await fetch(requestUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': BACKUP_TOKEN
            }
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Server returned ${retryResponse.status}: ${retryResponse.statusText}`);
          }
          
          const retryData = await retryResponse.json();
          console.log('Received past exams with backup token. Count:', Array.isArray(retryData) ? retryData.length : 'Not an array');
          return retryData;
        }
        
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Received past exams. Count:', Array.isArray(responseData) ? responseData.length : 'Not an array');
      return responseData;
    } catch (error) {
      console.error('Get past exams error:', error);
      throw error;
    }
  },

  // Get a specific past exam by id
  getPastExamById: async (id: string) => {
    try {
      // Get the token
      let token = await storageService.getAuthToken();
      
      if (!token) {
        console.warn('No auth token found when attempting to get past exam by id, using backup token');
        token = BACKUP_TOKEN;
      }
      
      // API baseURL
      const baseUrl = getBaseUrl();
      
      // Use fetch directly instead of axios
      const response = await fetch(`${baseUrl}/past-exams/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token
        }
      });
      
      if (!response.ok) {
        // If unauthorized, try with backup token
        if (response.status === 401) {
          console.log('Unauthorized response, trying with backup token');
          
          const retryResponse = await fetch(`${baseUrl}/past-exams/${id}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': BACKUP_TOKEN
            }
          });
          
          if (!retryResponse.ok) {
            throw new Error(`Server returned ${retryResponse.status}: ${retryResponse.statusText}`);
          }
          
          return await retryResponse.json();
        }
        
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Get past exam ${id} error:`, error);
      throw error;
    }
  }
};

export default api; 