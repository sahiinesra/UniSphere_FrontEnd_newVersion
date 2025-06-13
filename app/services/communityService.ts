import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const BASE_URL = 'http://192.168.1.57:8080/api/v1';

export const communityService = {
  getAllCommunities: async (page = 1, size = 10) => {
    try {
      const token = await getAccessToken();
      const response = await axios.get(
        `${BASE_URL}/communities?page=${page}&pageSize=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserRole: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }
      const response = await axios.get(
        `${BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('User role response:', response.data);
      return response.data.data.role;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      throw error;
    }
  },

  getMyCommunities: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }
      console.log('Making request to get my communities...');
      const response = await axios.get(
        `${BASE_URL}/my-communities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('My communities API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getMyCommunities:', error);
      throw error;
    }
  },

  updateCommunity: async (communityId: string, data: any) => {
    try {
      const token = await getAccessToken();
      const response = await axios.put(
        `${BASE_URL}/communities/${communityId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCommunity: async (communityId: string) => {
    try {
      const token = await getAccessToken();
      const response = await axios.delete(
        `${BASE_URL}/communities/${communityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 