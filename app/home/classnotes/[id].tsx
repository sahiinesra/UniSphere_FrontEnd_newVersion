import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface Note {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  content: string;
  departmentId: string;
  files: {
    id: string;
    name: string;
  }[];
}

export default function ClassNoteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };

  const fetchNoteDetail = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return;
      }

      const response = await axios.get(
        `http://10.200.0.7:8080/api/v1/class-notes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Note detail response:', response.data);
      setNote(response.data.data);
    } catch (error: any) {
      console.error('Error fetching note detail:', error);
      Alert.alert('Error', 'Failed to fetch note details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Note not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: note.title,
          headerStyle: {
            backgroundColor: '#FFD700',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#000000',
          },
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.courseCode}>{note.courseCode}</Text>
          <Text style={styles.title}>{note.title}</Text>
          <Text style={styles.description}>{note.description}</Text>
          
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Text style={styles.noteContent}>{note.content}</Text>
          </View>

          {note.files && note.files.length > 0 && (
            <View style={styles.filesSection}>
              <Text style={styles.sectionTitle}>Attached Files</Text>
              {note.files.map((file) => (
                <View key={file.id} style={styles.fileItem}>
                  <Ionicons name="document" size={20} color="#2196F3" />
                  <Text style={styles.fileName}>{file.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
  },
  courseCode: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  noteContent: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  filesSection: {
    marginTop: 20,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2196F3',
  },
}); 