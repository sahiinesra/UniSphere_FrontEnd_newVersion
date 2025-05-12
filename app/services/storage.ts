import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

// Storage service for handling AsyncStorage
export const storageService = {
  // Store auth token
  setAuthToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  },

  // Get auth token
  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  },

  // Store user data
  setUserData: async (userData: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Get user data
  getUserData: async (): Promise<any | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  // Clear all auth data (for logout)
  clearAuthData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};

export default storageService; 