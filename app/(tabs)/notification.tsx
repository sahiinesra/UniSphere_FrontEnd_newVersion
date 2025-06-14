import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Announcement {
  title: string;
  date: string;
  location?: string;
  url?: string;
}

const Notifications = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.0.22:8000/scraping/scrape-announcements'); 
      setAnnouncements(response.data.announcements);
    } catch (error: any) {
      console.error('Hata!', error);
      Alert.alert('Hata!', 'Duyurular alınmadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Alerts',
          headerStyle: {
            backgroundColor: '#FFD700',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#000000',
          },
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {announcements.length > 0 ? (
            announcements.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.announcementCard}
                onPress={() => {
                  if (item.url) {
                    Linking.openURL(item.url);
                  }
                }}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{item.date}</Text>
                {item.location && (
                  <TouchableOpacity 
                    style={styles.locationContainer}
                    onPress={() => {
                      if (item.url) {
                        Linking.openURL(item.url);
                      }
                    }}
                  >
                    <Ionicons name="location" size={16} color="#2196F3" />
                    <Text style={styles.location}>{item.location}</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Hiç duyuru bulunamadı.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#2196F3',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default Notifications;
