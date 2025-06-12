import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
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
  departmentId: string;
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
    paddingBottom: 100, // Add extra padding for bottom tabs
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    minWidth: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#888888',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
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
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // AI Button Styles
  aiContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.background,
    zIndex: 1,
  },
  aiButtonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  aiButton: {
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  permanentSpeechBubble: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000000',
    width: 180,
    marginRight: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    position: 'relative',
  },
  permanentSpeechBubbleText: {
    fontSize: 13,
    color: '#000000',
    textAlign: 'center',
  },
  speechBubbleTriangle: {
    position: 'absolute',
    right: -15,
    top: 15,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000000',
    transform: [{ rotate: '90deg' }],
  },
  speechBubbleTriangleInner: {
    position: 'absolute',
    right: -11,
    top: 15,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '90deg' }],
  },
  aiModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  aiSpeechBubble: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#000000',
    margin: 20,
    marginTop: 80,
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  aiSpeechBubbleText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 10,
  },
  aiDescriptionInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  aiModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  aiModalButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000000',
  },
  aiModalButtonCancel: {
    backgroundColor: '#FF3B30',
  },
  aiModalButtonCreate: {
    backgroundColor: '#2196F3',
  },
  aiModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default function ClassNotes() {
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
    departmentId: '',
    noteId: ''
  });

  // Add new state variables for AI feature
  const [isAiModalVisible, setAiModalVisible] = useState(false);
  const [aiDescription, setAiDescription] = useState('');

  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(text.toLowerCase()) ||
        note.courseCode.toLowerCase().includes(text.toLowerCase()) ||
        note.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
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
        'http://10.22.123.129:8080/api/v1/class-notes',
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
  useEffect(() => {
    const loadClassNotes = async () => {
      console.log('loadClassNotes called');
      setLoading(true);
      const notes = await fetchClassNotes();
      console.log('Fetched notes:', notes);
      setClassNotes(notes);
      setLoading(false);
    };


    loadClassNotes();
  }, []);

  // Add file picker function
  const handleFilePick = async () => {
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
          Alert.alert('Success', `Selected file: ${file.name}`);
        } else {
          Alert.alert('Error', 'Please select a PDF file');
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
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
      formDataObj.append('departmentId', formData.departmentId);
      formDataObj.append('description', formData.description);
      formDataObj.append('title', formData.title);
      formDataObj.append('userId', '1'); 

      if (selectedFile) {
        formDataObj.append('files', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name,
        } as any);
      }

      const response = await axios.post(
        'http://10.22.123.129:8080/api/v1/class-notes',
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const createdNote = response.data.data;

      const updatedNotes = [...notes, createdNote];
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      setCreateModalVisible(false);
      setSelectedFile(null);
      resetForm();

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
  
      const response = await axios.put(
        `http://192.168.0.24:8080/api/v1/class-notes/${formData.noteId}`,
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
  
      const updatedNote = response.data.data;
  
      const updatedNotes = notes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      );
  
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      setUpdateModalVisible(false);
      resetForm();
  
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
  
      const response = await axios.delete(
        `http://192.168.0.24:8080/api/v1/class-notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const message = response.data?.data?.message;
      console.log('Note deleted successfully:', message);
  
      // Fetch updated notes list
      const updatedClassNotes = await fetchClassNotes();
      setClassNotes(updatedClassNotes);
      
      // Close the modal and reset form
      setDeleteModalVisible(false);
      resetForm();

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
      departmentId: note.departmentId,
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
      departmentId: '',
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
        `http://192.168.0.24:8080/api/v1/files/${fileId}`,
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
          'http://192.168.0.24:8080'
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

  // Add new function to handle AI note creation
  const handleAiNoteCreate = () => {
    // This will be implemented later when connecting to the backend
    console.log('Creating AI note with description:', aiDescription);
    // Reset and close modal
    setAiDescription('');
    setAiModalVisible(false);
  };

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
        {/* AI Button and Permanent Speech Bubble */}
        <View style={styles.aiContainer}>
          <View style={styles.aiButtonContainer}>
            <View style={styles.permanentSpeechBubble}>
              <Text style={styles.permanentSpeechBubbleText}>
                Need help with notes? Let me assist you!
              </Text>
              <View style={styles.speechBubbleTriangle} />
              <View style={styles.speechBubbleTriangleInner} />
            </View>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => setAiModalVisible(true)}
            >
              <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Modal */}
        <Modal
          visible={isAiModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAiModalVisible(false)}
        >
          <View style={styles.aiModalContainer}>
            <View style={styles.aiSpeechBubble}>
              <Text style={styles.aiSpeechBubbleText}>
                Hi! I can help you create class notes. Please describe the topic or content you would like me to create notes about.
              </Text>
              <TextInput
                style={styles.aiDescriptionInput}
                placeholder="Enter your description here..."
                multiline={true}
                value={aiDescription}
                onChangeText={setAiDescription}
              />
              <View style={styles.aiModalButtons}>
                <TouchableOpacity
                  style={[styles.aiModalButton, styles.aiModalButtonCancel]}
                  onPress={() => {
                    setAiDescription('');
                    setAiModalVisible(false);
                  }}
                >
                  <Text style={styles.aiModalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.aiModalButton, styles.aiModalButtonCreate]}
                  onPress={handleAiNoteCreate}
                >
                  <Text style={styles.aiModalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
            {classNotes.map(note => (
              <View key={note.id} style={styles.card}>
                <View style={styles.noteHeader}>
                  <View>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteMeta}>
                      {note.courseCode} | Dept ID: {note.departmentId}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => initUpdateForm(note)}
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
              </View>
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

                  <Text style={styles.inputLabel}>Title (e.g. Week 1 - Introduction to Programming)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />

                  <Text style={styles.inputLabel}>Description (Brief summary of the note content)</Text>
                  <TextInput
                    style={[styles.input, { height: 50, textAlignVertical: 'top', paddingTop: 10 }]}
                    placeholder=""
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />

                  <Text style={styles.inputLabel}>Content (Detailed note content)</Text>
                  <TextInput
                    style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 10 }]}
                    placeholder=""
                    multiline
                    value={formData.content}
                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                  />

                  <Text style={styles.inputLabel}>Department ID (e.g. 1 for Computer Science)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({ ...formData, departmentId: text })}
                    keyboardType="numeric"
                  />

                  <TouchableOpacity
                    style={styles.uploadFileButton}
                    onPress={handleFilePick}
                  >
                    <Ionicons name="document-attach" size={20} color="#fff" />
                    <Text style={styles.uploadFileButtonText}>
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Add PDF File'}
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

                  <Text style={styles.inputLabel}>Content</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder=""
                    multiline
                    value={formData.content}
                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                  />

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
    </>
  );
} 