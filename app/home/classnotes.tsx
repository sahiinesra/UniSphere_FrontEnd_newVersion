import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
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
  fileId: string;
  fileName: string;
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

export default function ClassNotes() {
  // State for notes and UI controls
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for create/update form
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isAddFileModalVisible, setAddFileModalVisible] = useState(false);
  const [isDeleteFileModalVisible, setDeleteFileModalVisible] = useState(false);
  
  // Form states
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<FormData>({
    courseCode: '',
    title: '',
    description: '',
    content: '',
    departmentId: '',
    noteId: '',
    fileId: '',
    fileName: ''
  });

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

  // Handle create note
  const handleCreateNote = () => {
    // In a real app, this would make an API call
    const newNote: Note = {
      id: Date.now().toString(),
      courseCode: formData.courseCode,
      title: formData.title,
      description: formData.description,
      departmentId: formData.departmentId,
      files: []
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    setCreateModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'Note created successfully!');
  };

  // Handle update note
  const handleUpdateNote = () => {
    if (!currentNote) return;
    
    // In a real app, this would make an API call
    const updatedNotes = notes.map(note => 
      note.id === currentNote.id 
        ? {
            ...note,
            courseCode: formData.courseCode,
            title: formData.title,
            description: formData.description,
            departmentId: formData.departmentId
          }
        : note
    );
    
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    setUpdateModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'Note updated successfully!');
  };

  // Handle delete note
  const handleDeleteNote = () => {
    if (!formData.noteId) {
      Alert.alert('Error', 'Please enter a valid Note ID');
      return;
    }
    
    // In a real app, this would make an API call
    const updatedNotes = notes.filter(note => note.id !== formData.noteId);
    
    if (updatedNotes.length === notes.length) {
      Alert.alert('Error', 'Note not found with the given ID');
      return;
    }
    
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    setDeleteModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'Note deleted successfully!');
  };

  // Handle add file to note
  const handleAddFile = () => {
    if (!formData.noteId) {
      Alert.alert('Error', 'Please enter a valid Note ID');
      return;
    }
    
    // In a real app, this would make an API call
    const updatedNotes = notes.map(note => {
      if (note.id === formData.noteId) {
        return {
          ...note,
          files: [
            ...note.files, 
            { id: Date.now().toString(), name: formData.fileName || 'newfile.pdf' }
          ]
        };
      }
      return note;
    });
    
    if (JSON.stringify(updatedNotes) === JSON.stringify(notes)) {
      Alert.alert('Error', 'Note not found with the given ID');
      return;
    }
    
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    setAddFileModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'File added successfully!');
  };

  // Handle delete file from note
  const handleDeleteFile = () => {
    if (!formData.noteId || !formData.fileId) {
      Alert.alert('Error', 'Please enter valid Note ID and File ID');
      return;
    }
    
    // In a real app, this would make an API call
    let fileFound = false;
    const updatedNotes = notes.map(note => {
      if (note.id === formData.noteId) {
        const updatedFiles = note.files.filter(file => {
          if (file.id === formData.fileId) {
            fileFound = true;
            return false;
          }
          return true;
        });
        
        return { ...note, files: updatedFiles };
      }
      return note;
    });
    
    if (!fileFound) {
      Alert.alert('Error', 'Note or file not found with the given IDs');
      return;
    }
    
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
    setDeleteFileModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'File deleted successfully!');
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
      fileId: '',
      fileName: ''
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
      noteId: '',
      fileId: '',
      fileName: ''
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
            
            <TouchableOpacity 
              style={styles.managementButton}
              onPress={() => {
                resetForm();
                setAddFileModalVisible(true);
              }}
            >
              <Ionicons name="document-attach" size={20} color="#fff" />
              <Text style={styles.managementButtonText}>Add File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.managementButton}
              onPress={() => {
                resetForm();
                setDeleteFileModalVisible(true);
              }}
            >
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={styles.managementButtonText}>Delete File</Text>
            </TouchableOpacity>
          </View>
          
          {/* Notes List */}
          {filteredNotes.map(note => (
            <View key={note.id} style={styles.card}>
              <View style={styles.noteHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{note.title}</Text>
                  <Text style={styles.courseCode}>{note.courseCode} | {note.departmentId}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => initUpdateForm(note)}
                >
                  <Ionicons name="pencil" size={20} color="#2196F3" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionContent}>{note.description}</Text>
              
              {note.files.length > 0 && (
                <View style={styles.filesContainer}>
                  <Text style={styles.filesHeader}>Attached Files:</Text>
                  {note.files.map(file => (
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
          
          {filteredNotes.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No notes found</Text>
            </View>
          )}
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
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Course Code"
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({...formData, courseCode: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Content"
                    multiline
                    value={formData.content}
                    onChangeText={(text) => setFormData({...formData, content: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Department ID"
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({...formData, departmentId: text})}
                  />
                  
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
                    onChangeText={(text) => setFormData({...formData, courseCode: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Department ID"
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({...formData, departmentId: text})}
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
                      onPress={handleUpdateNote}
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
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Note ID"
                    value={formData.noteId}
                    onChangeText={(text) => setFormData({...formData, noteId: text})}
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
                      onPress={handleDeleteNote}
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
      
      {/* Add File Modal */}
      <Modal
        visible={isAddFileModalVisible}
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
                  <Text style={styles.modalTitle}>Add File to Note</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Note ID"
                    value={formData.noteId}
                    onChangeText={(text) => setFormData({...formData, noteId: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="File Name (e.g. lecture.pdf)"
                    value={formData.fileName}
                    onChangeText={(text) => setFormData({...formData, fileName: text})}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setAddFileModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={handleAddFile}
                    >
                      <Text style={styles.modalButtonText}>Add File</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Delete File Modal */}
      <Modal
        visible={isDeleteFileModalVisible}
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
                  <Text style={styles.modalTitle}>Delete File from Note</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Note ID"
                    value={formData.noteId}
                    onChangeText={(text) => setFormData({...formData, noteId: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="File ID"
                    value={formData.fileId}
                    onChangeText={(text) => setFormData({...formData, fileId: text})}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setDeleteFileModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.deleteButton]}
                      onPress={handleDeleteFile}
                    >
                      <Text style={styles.modalButtonText}>Delete File</Text>
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
}); 