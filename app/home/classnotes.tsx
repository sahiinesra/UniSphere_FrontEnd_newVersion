import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
        'http://192.168.0.24:8080/api/v1/class-notes',
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

  // Modify create note function to handle file upload
  const handleCreateNote = async () => {
    try {
      const token = await getAccessToken();

      if (!token) {
        Alert.alert('Error', 'JWT token bulunamadı.');
        return;
      }

      // Create form data for multipart request
      const formDataObj = new FormData();
      formDataObj.append('content', formData.content);
      formDataObj.append('courseCode', formData.courseCode);
      formDataObj.append('departmentId', formData.departmentId);
      formDataObj.append('description', formData.description);
      formDataObj.append('title', formData.title);
      formDataObj.append('userId', '1'); // auth sisteminden dinamik olarak alınmalı

      // Append file if selected
      if (selectedFile) {
        formDataObj.append('files', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name,
        } as any);
      }

      const response = await axios.post(
        'http://192.168.0.24:8080/api/v1/class-notes',
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
          title: formData.title,
          content: formData.content || "No content provided",
          courseCode: formData.courseCode,
          description: formData.description || "",
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

  return (
    <>
      <Stack.Screen options={{
        title: 'Class Notes',
      }} />

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
                    <View key={file.id} style={styles.fileItem}>
                      <Ionicons name="document" size={16} color="#2196F3" />
                      <Text style={styles.fileName}>{file.name}</Text>
                      <Text style={styles.fileId}>ID: {file.id}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.noteId}>Note ID: {note.id}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

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

                  <TextInput
                    style={styles.input}
                    placeholder="Course Code"
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({ ...formData, courseCode: text })}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Department ID"
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({ ...formData, departmentId: text })}
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