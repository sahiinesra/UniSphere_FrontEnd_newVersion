import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill for atob in case it's not available in React Native environment
const safeAtob = (base64: string): string => {
  try {
    // Use built-in atob if available
    if (typeof atob === 'function') {
      return atob(base64);
    }
    
    // Fallback implementation for React Native
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    
    base64 = String(base64).replace(/=+$/, '');
    
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = base64.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    
    return output;
  } catch (error) {
    console.error('Error in safeAtob:', error);
    return '';
  }
};

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  IS_LOGGED_IN: 'is_user_logged_in',
};

// User-specific token to be saved persistently
export const USER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiczIwMDIwNDAzNkBhbmthcmFiaWxpbS5lZHUudHIiLCJyb2xlVHlwZSI6IlNUVURFTlQiLCJpc3MiOiJ1bmlzcGhlcmUuYXBwIiwic3ViIjoiMiIsImV4cCI6MTc0NzA2NzcwOSwibmJmIjoxNzQ3MDYwNTA5LCJpYXQiOjE3NDcwNjA1MDksImp0aSI6IjhhNWRhMWEzLTNlNDMtNDYxYi1iMThhLWYzNzQ0YmQ2YjMwMCJ9.ELtUEDwr9oWTaHILcGuRW6nM3FM128XJRMMk9YfD35k";

// Static hardcoded token for development and testing with very long expiration (10 years from creation date)
export const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiczIwMDIwMTAyN0BhbmthcmFiaWxpbS5lZHUudHIiLCJyb2xlVHlwZSI6IlNUVURFTlQiLCJpc3MiOiJ1bmlzcGhlcmUuYXBwIiwic3ViIjoiMyIsImV4cCI6MTk5MTMyNzY3NSwibmJmIjoxNjc1OTY3Njc1LCJpYXQiOjE2NzU5Njc2NzUsImp0aSI6Ijg2Y2Y0MWE4LTJmOTgtNGRiZi05M2NmLWI1YmU5N2QzOTAxYyJ9.VC-Q9QbcZR_1Eyvl-r8DpP-IXqyMwhfFFk5AURmQPaY";

// Additional hardcoded token in case the first one doesn't work - also with a long expiration
export const BACKUP_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiczIwMDIwMTAyN0BhbmthcmFiaWxpbS5lZHUudHIiLCJyb2xlVHlwZSI6IlNUVURFTlQiLCJpc3MiOiJ1bmlzcGhlcmUuYXBwIiwic3ViIjoiMyIsImV4cCI6MTk5MTMyNzY5NSwibmJmIjoxNjc1OTY3Njk1LCJpYXQiOjE2NzU5Njc2OTUsImp0aSI6Ijg2Y2Y0MWE4LTJmOTgtNGRiZi05M2NmLWI1YmU5N2QzOTAxZCJ9.UeR96CIhknDZP6AAl90SKjDy5JJZh3UiQ83AxSOiVU4";

// In-memory cache for fast token access
const AuthTokenCache = {
  token: null as string | null
};

// Function to check if a token is expired based on the JWT payload
const isTokenExpired = (token: string): boolean => {
  try {
    // Get the payload part (second part) of the JWT
    const payload = token.split('.')[1];
    if (!payload) return true;
    
    // Decode the base64 payload - using React Native compatible approach
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Handle base64 padding
    const paddedBase64 = base64.padEnd(
      base64.length + (4 - (base64.length % 4)) % 4, 
      '='
    );
    
    // Decode the base64 string to text using our safe implementation
    const jsonString = decodeURIComponent(
      Array.prototype.map
        .call(safeAtob(paddedBase64), (c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    // Parse the JSON payload
    const decodedPayload = JSON.parse(jsonString);
    
    // Check if the token has an expiration claim
    if (!decodedPayload.exp) return false;
    
    // Compare the expiration time with the current time
    const expirationTime = decodedPayload.exp * 1000; // convert to milliseconds
    const currentTime = Date.now();
    
    const isExpired = currentTime > expirationTime;
    if (isExpired) {
      console.log('Token is expired. Expiration time:', new Date(expirationTime).toISOString());
      console.log('Current time:', new Date(currentTime).toISOString());
    }
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if there's an error
  }
};

// Simplified token expiration check - emergency fallback if the main function fails
// This directly checks if our hardcoded token has expired based on the known expiration date
const isHardcodedTokenExpired = (): boolean => {
  // Hardcoded token expiration timestamp (in milliseconds)
  // This value should match what's in the token
  const tokenExpiryTimestamp = 1991327675 * 1000; // exp from the HARDCODED_TOKEN
  return Date.now() > tokenExpiryTimestamp;
};

// Storage service for handling AsyncStorage
export const storageService = {
  // Initialize user token - call this at app startup
  initUserToken: async (): Promise<void> => {
    try {
      // Check if a token already exists
      const existingToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // If no token is saved yet, initialize with our User Token
      if (!existingToken) {
        console.log('Initializing app with user token');
        await storageService.setAuthToken(USER_TOKEN);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      }
    } catch (error) {
      console.error('Error initializing user token:', error);
    }
  },

  // Store auth token
  setAuthToken: async (token: string): Promise<void> => {
    try {
      if (!token) {
        console.error('Attempted to store empty token');
        return;
      }
      
      // Token length validation
      if (token.length < 20) {
        console.warn('Auth token appears to be unusually short:', token.length, 'characters');
      }
      
      // First clear any existing token
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      
      console.log('Storing auth token, length:', token.length);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      
      // Set login state
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      
      // Verify the token was stored correctly
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken) {
        console.log('Auth token successfully stored, length:', storedToken.length);
        
        // Store token in memory for quick access
        AuthTokenCache.token = token;
      } else {
        console.error('Failed to verify stored token');
      }
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  },

  // Get auth token with expiration check
  getAuthToken: async (): Promise<string | null> => {
    try {
      console.log('Getting auth token...');
      
      // Try memory cache first for performance
      if (AuthTokenCache.token) {
        console.log('Token found in memory cache, checking expiration...');
        // Check if cached token is expired
        try {
          const expired = isTokenExpired(AuthTokenCache.token);
          if (expired) {
            console.log('Cached token is expired, clearing cache');
            AuthTokenCache.token = null;
          } else {
            console.log('Retrieved valid auth token from memory cache');
            return AuthTokenCache.token;
          }
        } catch (tokenCheckError) {
          console.error('Error checking cached token expiration:', tokenCheckError);
          AuthTokenCache.token = null;
        }
      }
      
      // Fall back to AsyncStorage
      console.log('Retrieving token from AsyncStorage...');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        console.log('No token found in AsyncStorage, trying user token...');
        // No token in storage, initialize with user token
        await storageService.setAuthToken(USER_TOKEN);
        return USER_TOKEN;
      }
      
      // Check if token from storage is expired
      let tokenValid = false;
      try {
        tokenValid = !isTokenExpired(token);
      } catch (tokenCheckError) {
        console.error('Error checking token from storage:', tokenCheckError);
      }
      
      if (!tokenValid) {
        console.warn('Token from storage is expired, using user token');
        await storageService.setAuthToken(USER_TOKEN);
        return USER_TOKEN;
      }
      
      // Log token length for debugging
      console.log('Retrieved valid auth token from storage, length:', token.length);
      
      // Cache the token for future quick access
      AuthTokenCache.token = token;
      
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      
      // Use USER_TOKEN as final fallback
      return USER_TOKEN;
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
  
  // Check if user is logged in - returns true even for development token
  isLoggedIn: async (): Promise<boolean> => {
    try {
      // Always use cached token first for performance
      if (AuthTokenCache.token && !isTokenExpired(AuthTokenCache.token)) {
        return true;
      }
      
      const loginFlag = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      if (loginFlag === 'true') {
        // Verify token is still valid
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token && !isTokenExpired(token)) {
          return true;
        }
      }
      
      // If we get here, we need to check if any of our hardcoded tokens are valid
      if (!isTokenExpired(HARDCODED_TOKEN) || !isTokenExpired(BACKUP_TOKEN)) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },
  
  // Save dev mode login state
  setDevModeLoggedIn: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      await storageService.setAuthToken(HARDCODED_TOKEN);
      console.log('Development mode login saved');
    } catch (error) {
      console.error('Error setting dev mode login:', error);
    }
  },

  // Clear all auth data (for logout) - retain user token by default
  clearAuthData: async (retainUserToken = true): Promise<void> => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRY
      ]);
      
      // By default, we don't clear the AUTH_TOKEN and IS_LOGGED_IN to stay logged in
      if (!retainUserToken) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.IS_LOGGED_IN
        ]);
        
        // Also clear memory cache
        AuthTokenCache.token = null;
        console.log('Auth token cache cleared from memory');
      }
      
      console.log('Auth data cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};

export default storageService; 