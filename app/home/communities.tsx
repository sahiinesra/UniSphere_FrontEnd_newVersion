import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define colors to match the application theme
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
  primary: '#4CAF50',
  danger: '#f44336',
};

export type Community = {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  abbreviation: string;
  logoUri?: string;
};

// Initial mock data for communities
const initialMockCommunities: Community[] = [
  {
    id: '1',
    name: 'Computer Science Society',
    category: 'Academic Clubs',
    memberCount: 150,
    abbreviation: 'CSS',
  },
  {
    id: '2',
    name: 'Photography Club',
    category: 'Arts & Culture',
    memberCount: 75,
    abbreviation: 'PC',
  },
  // Add more mock communities as needed
];

export default function Communities() {
  const router = useRouter();
  const { newCommunity } = useLocalSearchParams();
  const [showMyCommunities, setShowMyCommunities] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [communities, setCommunities] = useState<Community[]>(initialMockCommunities);

  useEffect(() => {
    if (newCommunity) {
      try {
        const parsedCommunity = JSON.parse(newCommunity as string) as Community;
        setCommunities(prev => [...prev, parsedCommunity]);
      } catch (error) {
        console.error('Error parsing new community data:', error);
      }
    }
  }, [newCommunity]);

  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };

  const fetchCommunities = async (page = 1, size = 10) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return [];
      }

      const response = await axios.get(
        `http://192.168.0.24:8080/api/v1/communities?page=${page}&pageSize=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const communities = response.data.data.communities.map((community: any) => ({
        ...community,
      }));

      console.log('Fetched Communities:', JSON.stringify(communities, null, 2));
      return communities;

    } catch (error) {
      console.error('Failed to fetch communities:', error);
      Alert.alert('Error', 'Failed to retrieve communities.');
      return [];
    }
  };

  useEffect(() => {
    const loadCommunities = async () => {
      const data = await fetchCommunities();
      setCommunities(data);
    };
    loadCommunities();
  }, []);

  const handleCommunityPress = (communityId: string) => {
    router.push(`/home/community/${communityId}`);
  };

  //handle join community
  const handleJoinCommunity = (communityId: string) => {
    setJoinedCommunities(prev => [...prev, communityId]);
  };

  
//update community
  const handleUpdateCommunity = (communityId: string) => {
    // TODO: Implement update community functionality
  };
//delete community
  const handleDeleteCommunity = (communityId: string) => {
    setCommunities(prev => prev.filter(c => c.id !== communityId));
    // TODO: Implement delete community functionality with backend
  };

  const displayedCommunities = showMyCommunities
    ? communities.filter(c => joinedCommunities.includes(c.id))
    : communities;

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Communities',
      }} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.tabButton, !showMyCommunities && styles.activeTab]}
            onPress={() => setShowMyCommunities(false)}
          >
            <Text style={styles.tabButtonText}>All Communities</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, showMyCommunities && styles.activeTab]}
            onPress={() => setShowMyCommunities(true)}
          >
            <Text style={styles.tabButtonText}>My Communities</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/home/community/create' as any)}
        >
          <Text style={styles.buttonText}>Create New Community</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          {displayedCommunities.map((community) => (
            <View key={community.id} style={styles.card}>
              <TouchableOpacity 
                onPress={() => handleCommunityPress(community.id)}
                style={styles.communityHeader}
              >
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.memberCount}>
                  Members: {community.memberCount}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={() => handleUpdateCommunity(community.id)}
                >
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteCommunity(community.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.background,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  createButton: {
    margin: 10,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  communityHeader: {
    marginBottom: 10,
  },
  communityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  memberCount: {
    fontSize: 14,
    color: colors.text,
    marginTop: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.cardBackground,
    fontWeight: 'bold',
  },
}); 