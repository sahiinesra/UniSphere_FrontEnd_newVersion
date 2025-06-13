import * as SecureStore from 'expo-secure-store';

export const getAccessToken = async () => {
  const token = await SecureStore.getItemAsync('accessToken');
  return token;
}; 