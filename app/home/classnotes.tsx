import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Define API URL based on platform
const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000',    // Android Emulator
  ios: 'http://10.200.0.156:8000',      // iOS - Using localhost
  default: 'http://10.200.0.156:8000'   // Web/default
});

// Axios instance with timeout and error handling
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Response Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      }
    });
    return Promise.reject(error);
  }
);

// Define colors to match the application theme
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
  primaryButtonBackground: '#1E90FF', // Buttons are Blue
  primaryButtonText: '#FFFFFF', // Button text is White
  inputBackground: '#FFFFFF', // Input background is White
};

// Define types for our data
interface NoteFile {
  id: string;
  name: string;
}

interface Note {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  departmentId: string;
  files: NoteFile[];
}

interface FormData {
  courseCode: string;
  title: string;
  description: string;
  content: string;
  noteId: string;
}

// Add new interface for selected file
interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
}

// Mock data for class notes
const initialNotes: Note[] = [
  {
    id: '1',
    courseCode: 'CS101',
    title: 'Introduction to Python',
    description: 'Fundamental concepts of Python programming',
    departmentId: 'CS',
    files: [
      { id: 'f1', name: 'Lecture1.pdf' },
      { id: 'f2', name: 'PythonBasics.docx' }
    ]
  },
  {
    id: '2',
    courseCode: 'MATH201',
    title: 'Calculus I',
    description: 'Derivatives, integrals and their applications',
    departmentId: 'MATH',
    files: [
      { id: 'f3', name: 'DerivativesNotes.pdf' }
    ]
  },
  {
    id: '3',
    courseCode: 'ENG301',
    title: 'Circuit Analysis',
    description: 'Analysis of electrical circuits using various methods',
    departmentId: 'ENG',
    files: [
      { id: 'f4', name: 'CircuitBasics.pdf' },
      { id: 'f5', name: 'CircuitExercises.pdf' }
    ]
  }
];

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  managementButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  managementButton: {
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    marginBottom: 10,
  },
  managementButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    maxWidth: '90%',
  },
  courseCode: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    marginBottom: 15,
  },
  editButton: {
    padding: 5,
  },
  filesContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  },
  filesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#F0F0F0',
    padding: 5,
    borderRadius: 3,
  },
  fileName: {
    marginLeft: 5,
    fontSize: 14,
    flex: 1,
  },
  fileId: {
    fontSize: 12,
    color: '#666666',
  },
  noteId: {
    fontSize: 12,
    color: '#666666',
    marginTop: 10,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  contentContainer: {
    marginBottom: 15,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiHelpButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiHelpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentInput: {
    height: 150,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
  aiDescriptionModal: {
    backgroundColor: '#FFFFFF',
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiDescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  aiDescriptionIcon: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  aiDescriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  aiDescriptionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  aiDescriptionInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    textAlignVertical: 'top',
  },
  aiDescriptionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  aiDescriptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  aiDescriptionButtonCancel: {
    backgroundColor: '#DDD',
  },
  aiDescriptionButtonGenerate: {
    backgroundColor: '#2196F3',
  },
  aiDescriptionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  noteMeta: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  uploadFileButton: {
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  uploadFileButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default function ClassNotes() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classNotes, setClassNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  // State for create/update form
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  // Form states
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<FormData>({
    courseCode: '',
    title: '',
    description: '',
    content: '',
    noteId: ''
  });

  // Add AI states
  const [isAiDescriptionModalVisible, setAiDescriptionModalVisible] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text) {
      const searchText = text.toLowerCase();
      const filtered = classNotes.filter(note =>
        (note.title?.toLowerCase() || '').includes(searchText) ||
        (note.courseCode?.toLowerCase() || '').includes(searchText) ||
        (note.description?.toLowerCase() || '').includes(searchText) ||
        (note.departmentId?.toString() || '').toLowerCase().includes(searchText)
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(classNotes);
    }
  };

  //get notes
  const fetchClassNotes = async (page = 1, size = 10) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return [];
      }

      const response = await axios.get(
        'http://10.200.0.156:8080/api/v1/class-notes',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: {
            page,
            size,
          },
        }
      );

      const classNotes = response.data.data.classNotes;
      return classNotes;

    } catch (error) {
      console.error('Failed to fetch class notes:', error);
      Alert.alert('Error', 'Failed to retrieve class notes.');
      return [];
    }
  };

  const loadClassNotes = async () => {
    console.log('loadClassNotes called');
    setLoading(true);
    const notes = await fetchClassNotes();
    console.log('Fetched notes:', notes);
    setClassNotes(notes);
    setFilteredNotes(notes);
    setLoading(false);
  };

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing class notes...');
      loadClassNotes();
    }, [])
  );

  // Add file picker function
  const handleFilePick = async () => {
    try {
      Alert.alert(
        'Select File Type',
        'Choose the type of file you want to upload',
        [
          {
            text: 'PDF Document',
            onPress: handlePDFPick
          },
          {
            text: 'Image',
            onPress: handleImagePick
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error with file selection:', error);
      Alert.alert('Error', 'Failed to handle file selection');
    }
  };

  // Handle PDF file selection
  const handlePDFPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.mimeType === 'application/pdf') {
          setSelectedFile({
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          });
          Alert.alert('Success', `Selected PDF: ${file.name}`);
        } else {
          Alert.alert('Error', 'Please select a PDF file');
        }
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  // Handle image file selection
  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.fileName || `image_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        });
        Alert.alert('Success', 'Image selected successfully');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // create note
  const handleCreateNote = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token bulunamadı.');
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append('content', formData.content);
      formDataObj.append('courseCode', formData.courseCode);
      formDataObj.append('description', formData.description);
      formDataObj.append('title', formData.title);
      formDataObj.append('departmentId', '1'); // Default department ID
      formDataObj.append('userId', '1');

      if (selectedFile) {
        formDataObj.append('files', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name,
        } as any);
      }

      console.log('Sending data to create note:', {
        content: formData.content,
        courseCode: formData.courseCode,
        description: formData.description,
        title: formData.title
      });

      const response = await axios.post(
        'http://10.200.0.156:8080/api/v1/class-notes',
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Create note response:', response.data);

      // Close modal and reset form first
      setCreateModalVisible(false);
      setSelectedFile(null);
      resetForm();

      // Then fetch fresh data
      await loadClassNotes();

      Alert.alert('Success', 'Note created successfully!');
    } catch (error: any) {
      console.error('Create note error:', error.response?.data || error.message);
      Alert.alert('Error', 'An error occurred while creating the note.');
    }
  };

  // Handle update note
  const handleUpdateClassNote = async () => {
    if (!formData.noteId) {
      Alert.alert('Error', 'Note ID is missing.');
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return;
      }

      await axios.put(
        `http://10.200.0.156:8080/api/v1/class-notes/${formData.noteId}`,
        {
          content: formData.content,
          courseCode: formData.courseCode,
          description: formData.description,
          title: formData.title
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Close modal and reset form first
      setUpdateModalVisible(false);
      resetForm();

      // Then fetch fresh data
      await loadClassNotes();

      Alert.alert('Success', 'Class note updated successfully!');
    } catch (error: any) {
      console.error('Update class note error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update class note.');
    }
  };
  
  // Handle delete note
  const handleDeleteNote = async (noteId: number) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return;
      }

      await axios.delete(
        `http://10.200.0.156:8080/api/v1/class-notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Close modal first
      setDeleteModalVisible(false);
      resetForm();

      // Then fetch fresh data
      await loadClassNotes();

      Alert.alert('Success', 'Note deleted successfully!');
    } catch (error: any) {
      console.error('Delete note error:', error);
      Alert.alert('Error', 'Failed to delete note.');
    }
  };
  

  // Initialize update form with current note data
  const initUpdateForm = (note: Note) => {
    setCurrentNote(note);
    setFormData({
      courseCode: note.courseCode,
      title: note.title,
      description: note.description,
      content: '',
      noteId: note.id,
    });
    setUpdateModalVisible(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      courseCode: '',
      title: '',
      description: '',
      content: '',
      noteId: ''
    });
    setCurrentNote(null);
  };

  // Update handleFileOpen function to use the file URL from backend
  const handleFileOpen = async (fileId: string) => {
    try {
      const token = await getAccessToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // First get the file details from the API
      const response = await axios.get(
        `http://10.200.0.156:8080/api/v1/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.data?.data?.fileUrl) {
        // Replace localhost with the production URL
        const fileUrl = response.data.data.fileUrl.replace(
          'http://localhost:8080',
          'http://10.200.0.156:8080'
        );

        const supported = await Linking.canOpenURL(fileUrl);
        if (supported) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert('Error', 'Cannot open this file type');
        }
      } else {
        Alert.alert('Error', 'File URL not found');
      }
    } catch (error: any) {
      console.error('Error opening file:', error);
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Not authorized to access this file. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to open file');
      }
    }
  };

  // Function to handle AI content generation
  const handleGenerateContent = async () => {
    if (!aiDescription.trim()) {
      Alert.alert('Error', 'Please enter a description for the content.');
      return;
    }

    setIsGeneratingContent(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return;
      }

      console.log('Attempting to generate content with:', {
        url: `${API_URL}/generate_note`,
        description: formData.description
      });

      const response = await api.post('/generate_note', {
        topic: formData.description,
        max_words: 500
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setFormData(prev => ({
          ...prev,
          content: response.data
        }));
      } else {
        throw new Error('No content received from the server');
      }
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Failed to generate content.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running and accessible.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error',
        errorMessage
      );
    } finally {
      setIsGeneratingContent(false);
    }
  };

  useEffect(() => {
    // Update content when params change
    if (params.content) {
      setFormData(prev => ({
        ...prev,
        content: params.content as string
      }));
    }
  }, [params.content]);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Class Notes',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.text,
        },
      }} />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for notes..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <Ionicons name="search" size={24} color="#000" style={styles.searchIcon} />
            </View>

            {/* Management Buttons - Only visible to authorized users */}
            <View style={styles.managementButtons}>
              <TouchableOpacity
                style={styles.managementButton}
                onPress={() => {
                  resetForm();
                  setCreateModalVisible(true);
                }}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.managementButtonText}>Create New</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.managementButton}
                onPress={() => {
                  resetForm();
                  setDeleteModalVisible(true);
                }}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.managementButtonText}>Delete Note</Text>
              </TouchableOpacity>
            </View>

            {/* Class Notes List */}
            {filteredNotes.map(note => (
              <TouchableOpacity
                key={note.id}
                style={styles.card}
                onPress={() => router.push(`/home/classnotes/${note.id}`)}
              >
                <View style={styles.noteHeader}>
                  <View>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteMeta}>
                      {note.courseCode} | Dept ID: {note.departmentId}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent card click when edit button is clicked
                      initUpdateForm(note);
                    }}
                  >
                    <Ionicons name="pencil" size={20} color="#2196F3" />
                  </TouchableOpacity>
                </View>

                {Array.isArray(note.files) && note.files.length > 0 && (
                  <View style={styles.filesContainer}>
                    <Text style={styles.filesHeader}>Note Files:</Text>
                    {note.files.map((file: NoteFile) => (
                      <TouchableOpacity
                        key={file.id}
                        style={styles.fileItem}
                        onPress={() => handleFileOpen(file.id)}
                      >
                        <Ionicons name="document" size={16} color="#2196F3" />
                        <Text style={[styles.fileName, { color: '#2196F3', textDecorationLine: 'underline' }]}>
                          {file.name}
                        </Text>
                        <Text style={styles.fileId}>ID: {file.id}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.noteId}>Note ID: {note.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Create Note Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Create New Class Note</Text>

                  <Text style={styles.inputLabel}>Course Code (e.g. CS101)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({ ...formData, courseCode: text })}
                  />

                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />

                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, { height: 50, textAlignVertical: 'top', paddingTop: 10 }]}
                    placeholder=""
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />

                  <View style={styles.contentContainer}>
                    <View style={styles.contentHeader}>
                      <Text style={styles.inputLabel}>Content</Text>
                      <TouchableOpacity
                        style={styles.aiHelpButton}
                        onPress={async () => {
                          if (!formData.description.trim()) {
                            Alert.alert('Error', 'Please enter a description first.');
                            return;
                          }
                          setIsGeneratingContent(true);
                          try {
                            const token = await getAccessToken();
                            if (!token) {
                              Alert.alert('Error', 'JWT token not found.');
                              return;
                            }

                            console.log('Attempting to generate content with:', {
                              url: `${API_URL}/generate_note`,
                              description: formData.description
                            });

                            const response = await api.post('/generate_note', {
                              topic: formData.description,
                              max_words: 500
                            }, {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });

                            if (response.data) {
                              setFormData(prev => ({
                                ...prev,
                                content: response.data
                              }));
                            } else {
                              throw new Error('No content received from the server');
                            }
                          } catch (error: any) {
                            console.error('Error details:', {
                              message: error.message,
                              code: error.code,
                              response: error.response?.data,
                              config: error.config
                            });
                            
                            let errorMessage = 'Failed to generate content.';
                            if (error.code === 'ECONNABORTED') {
                              errorMessage = 'Request timed out. Please check your internet connection.';
                            } else if (error.code === 'ERR_NETWORK') {
                              errorMessage = 'Network error. Please check if the server is running and accessible.';
                            } else if (error.response?.data?.message) {
                              errorMessage = error.response.data.message;
                            } else if (error.message) {
                              errorMessage = error.message;
                            }
                            
                            Alert.alert(
                              'Error',
                              errorMessage
                            );
                          } finally {
                            setIsGeneratingContent(false);
                          }
                        }}
                        disabled={isGeneratingContent}
                      >
                        {isGeneratingContent ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.aiHelpText}>Generating...</Text>
                          </View>
                        ) : (
                          <>
                            <MaterialCommunityIcons name="star-four-points" size={16} color="#FFFFFF" />
                            <Text style={styles.aiHelpText}>Get AI Help</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.contentInput}
                      placeholder="Enter your note content here..."
                      multiline
                      scrollEnabled
                      value={formData.content}
                      onChangeText={(text) => setFormData({ ...formData, content: text })}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.uploadFileButton}
                    onPress={handleFilePick}
                  >
                    <Ionicons name="document-attach" size={20} color="#fff" />
                    <Text style={styles.uploadFileButtonText}>
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Add PDF or Image'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setCreateModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={handleCreateNote}
                    >
                      <Text style={styles.modalButtonText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Update Note Modal */}
      <Modal
        visible={isUpdateModalVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Update Class Note</Text>

                  <Text style={styles.inputLabel}>Course Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({ ...formData, courseCode: text })}
                  />

                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />

                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder=""
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />

                  <View style={styles.contentContainer}>
                    <View style={styles.contentHeader}>
                      <Text style={styles.inputLabel}>Content</Text>
                      <TouchableOpacity
                        style={styles.aiHelpButton}
                        onPress={async () => {
                          if (!formData.description.trim()) {
                            Alert.alert('Error', 'Please enter a description first.');
                            return;
                          }
                          setIsGeneratingContent(true);
                          try {
                            const token = await getAccessToken();
                            if (!token) {
                              Alert.alert('Error', 'JWT token not found.');
                              return;
                            }

                            console.log('Attempting to generate content with:', {
                              url: `${API_URL}/generate_note`,
                              description: formData.description
                            });

                            const response = await api.post('/generate_note', {
                              topic: formData.description,
                              max_words: 500
                            }, {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });

                            if (response.data) {
                              setFormData(prev => ({
                                ...prev,
                                content: response.data
                              }));
                            } else {
                              throw new Error('No content received from the server');
                            }
                          } catch (error: any) {
                            console.error('Error details:', {
                              message: error.message,
                              code: error.code,
                              response: error.response?.data,
                              config: error.config
                            });
                            
                            let errorMessage = 'Failed to generate content.';
                            if (error.code === 'ECONNABORTED') {
                              errorMessage = 'Request timed out. Please check your internet connection.';
                            } else if (error.code === 'ERR_NETWORK') {
                              errorMessage = 'Network error. Please check if the server is running and accessible.';
                            } else if (error.response?.data?.message) {
                              errorMessage = error.response.data.message;
                            } else if (error.message) {
                              errorMessage = error.message;
                            }
                            
                            Alert.alert(
                              'Error',
                              errorMessage
                            );
                          } finally {
                            setIsGeneratingContent(false);
                          }
                        }}
                        disabled={isGeneratingContent}
                      >
                        {isGeneratingContent ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.aiHelpText}>Generating...</Text>
                          </View>
                        ) : (
                          <>
                            <MaterialCommunityIcons name="star-four-points" size={16} color="#FFFFFF" />
                            <Text style={styles.aiHelpText}>Get AI Help</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.contentInput}
                      placeholder="Enter your note content here..."
                      multiline
                      scrollEnabled
                      value={formData.content}
                      onChangeText={(text) => setFormData({ ...formData, content: text })}
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setUpdateModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={handleUpdateClassNote}
                    >
                      <Text style={styles.modalButtonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Note Modal */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Delete Class Note</Text>

                  <Text style={styles.inputLabel}>Note ID (You can find this at the bottom of each note card)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.noteId}
                    onChangeText={(text) => setFormData({ ...formData, noteId: text })}
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setDeleteModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.deleteButton]}
                      onPress={() => handleDeleteNote(parseInt(formData.noteId))}
                    >
                      <Text style={styles.modalButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* AI Description Modal */}
      <Modal
        visible={isAiDescriptionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAiDescriptionModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start' }}>
          <View style={styles.aiDescriptionModal}>
            {isGeneratingContent ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Generating your content...</Text>
              </View>
            ) : (
              <>
                <View style={styles.aiDescriptionHeader}>
                  <View style={styles.aiDescriptionIcon}>
                    <MaterialCommunityIcons name="star-four-points" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.aiDescriptionTitle}>AI Content Generator</Text>
                </View>
                
                <Text style={styles.aiDescriptionSubtitle}>
                  Describe what you want me to write about. I will generate relevant content for your notes (max 500 words).
                </Text>

                <TextInput
                  style={styles.aiDescriptionInput}
                  placeholder="Example: Write about the basic concepts of object-oriented programming..."
                  multiline
                  value={aiDescription}
                  onChangeText={setAiDescription}
                />

                <View style={styles.aiDescriptionButtons}>
                  <TouchableOpacity
                    style={[styles.aiDescriptionButton, styles.aiDescriptionButtonCancel]}
                    onPress={() => {
                      setAiDescription('');
                      setAiDescriptionModalVisible(false);
                    }}
                  >
                    <Text style={styles.aiDescriptionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.aiDescriptionButton, styles.aiDescriptionButtonGenerate]}
                    onPress={handleGenerateContent}
                  >
                    <Text style={styles.aiDescriptionButtonText}>Generate</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
} 