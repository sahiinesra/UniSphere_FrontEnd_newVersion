import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
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

// Define types for our data
interface ExamFile {
  id: string;
  name: string;
}

interface PastExam {
  id: string;
  year: string;
  term: string;
  departmentId: string;
  courseCode: string;
  title: string;
  files: ExamFile[];
}

interface FormData {
  year: string;
  term: string;
  departmentId: string;
  courseCode: string;
  title: string;
  examId: string;
  fileId: string;
  fileName: string;
}

// Mock data for past exams
const initialExams: PastExam[] = [
  {
    id: '1',
    year: '2023',
    term: 'Fall',
    departmentId: 'CS',
    courseCode: 'CS101',
    title: 'Introduction to Programming',
    files: [
      { id: 'f1', name: 'Midterm_2023.pdf' },
      { id: 'f2', name: 'Final_2023.pdf' }
    ]
  },
  {
    id: '2',
    year: '2023',
    term: 'Spring',
    departmentId: 'MATH',
    courseCode: 'MATH201',
    title: 'Calculus I',
    files: [
      { id: 'f3', name: 'Midterm_Spring2023.pdf' }
    ]
  },
  {
    id: '3',
    year: '2022',
    term: 'Fall',
    departmentId: 'ENG',
    courseCode: 'ENG301',
    title: 'Circuit Analysis',
    files: [
      { id: 'f4', name: 'Quiz1_2022.pdf' },
      { id: 'f5', name: 'Final_2022.pdf' }
    ]
  }
];

export default function PastExams() {
  const [exams, setExams] = useState<PastExam[]>([]);
  const [filteredExams, setFilteredExams] = useState<PastExam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // UI Modals
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isAddFileModalVisible, setAddFileModalVisible] = useState(false);
  const [isDeleteFileModalVisible, setDeleteFileModalVisible] = useState(false);

  // Form states
  const [currentExam, setCurrentExam] = useState<PastExam | null>(null);
  const [formData, setFormData] = useState<FormData>({
    year: '',
    term: '',
    departmentId: '',
    courseCode: '',
    title: '',
    examId: '',
    fileId: '',
    fileName: ''
  });

  useEffect(() => {
    const loadExams = async () => {
      const data = await fetchPastExams();
      setExams(data);
      setFilteredExams(data);
    };

    loadExams();
  }, []);

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text) {
      const filtered = exams.filter(exam => 
        exam.title.toLowerCase().includes(text.toLowerCase()) ||
        exam.courseCode.toLowerCase().includes(text.toLowerCase()) ||
        exam.term.toLowerCase().includes(text.toLowerCase()) ||
        exam.year.includes(text)
      );
      setFilteredExams(filtered);
    } else {
      setFilteredExams(exams);
    }
  };

  // Handle create exam


  const getAccessToken = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return token;
  };
  
  const fetchPastExams = async (page = 1, size = 10) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return [];
      }
  
      const response = await axios.get(
        `http://192.168.1.199:8080/api/v1/past-exams`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const pastExams = response.data.data.pastExams;
      return pastExams;
  
    } catch (error) {
      console.error('Failed to fetch past exams:', error);
      Alert.alert('Error', 'Failed to retrieve past exams.');
      return [];
    }
  };

const handleCreateExam = async () => {
  try {
    const token = await getAccessToken();

    if (!token) {
      Alert.alert('Error', 'JWT token bulunamadı.');
      return;
    }

    const response = await axios.post(
      'http://192.168.1.199:8080/api/v1/past-exams',
      {
        year: parseInt(formData.year, 10),
        term: (formData.term), // önceki mesajda verdiğimiz normalization fonksiyonu
        departmentId: parseInt(formData.departmentId, 10),
        courseCode: formData.courseCode,
        title: formData.title,
        fileIds: [],
        instructorId: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const createdExam = response.data.data;

    const updatedExams = [...exams, createdExam];
    setExams(updatedExams);
    setFilteredExams(updatedExams);
    setCreateModalVisible(false);
    resetForm();

    Alert.alert('Success', 'Exam created successfully!');
  } catch (error: any) {
    console.error('Create exam error:', error);
    Alert.alert('Error', 'Sınav oluşturulurken bir hata oluştu.');
  }
};

  // Handle update exam
  const handleUpdateExam = () => {
    if (!currentExam) return;
    
    // In a real app, this would make an API call
    const updatedExams = exams.map(exam => 
      exam.id === currentExam.id 
        ? {
            ...exam,
            year: formData.year,
            term: formData.term,
            departmentId: formData.departmentId,
            courseCode: formData.courseCode,
            title: formData.title
          }
        : exam
    );
    
    setExams(updatedExams);
    setFilteredExams(updatedExams);
    setUpdateModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'Exam updated successfully!');
  };

  // Handle delete exam
  const handleDeleteExam = () => {
    if (!formData.examId) {
      Alert.alert('Error', 'Please enter a valid Exam ID');
      return;
    }
    
    // In a real app, this would make an API call
    const updatedExams = exams.filter(exam => exam.id !== formData.examId);
    
    if (updatedExams.length === exams.length) {
      Alert.alert('Error', 'Exam not found with the given ID');
      return;
    }
    
    setExams(updatedExams);
    setFilteredExams(updatedExams);
    setDeleteModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'Exam deleted successfully!');
  };

  // Handle add file to exam
  const handleAddFile = () => {
    if (!formData.examId) {
      Alert.alert('Error', 'Please enter a valid Exam ID');
      return;
    }
    
    // In a real app, this would make an API call
    const updatedExams = exams.map(exam => {
      if (exam.id === formData.examId) {
        return {
          ...exam,
          files: [
            ...exam.files, 
            { id: Date.now().toString(), name: formData.fileName || 'newfile.pdf' }
          ]
        };
      }
      return exam;
    });
    
    if (JSON.stringify(updatedExams) === JSON.stringify(exams)) {
      Alert.alert('Error', 'Exam not found with the given ID');
      return;
    }
    
    setExams(updatedExams);
    setFilteredExams(updatedExams);
    setAddFileModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'File added successfully!');
  };

  // Handle delete file from exam
  const handleDeleteFile = () => {
    if (!formData.examId || !formData.fileId) {
      Alert.alert('Error', 'Please enter valid Exam ID and File ID');
      return;
    }
    
    // In a real app, this would make an API call
    let fileFound = false;
    const updatedExams = exams.map(exam => {
      if (exam.id === formData.examId) {
        const updatedFiles = exam.files.filter(file => {
          if (file.id === formData.fileId) {
            fileFound = true;
            return false;
          }
          return true;
        });
        
        return { ...exam, files: updatedFiles };
      }
      return exam;
    });
    
    if (!fileFound) {
      Alert.alert('Error', 'Exam or file not found with the given IDs');
      return;
    }
    
    setExams(updatedExams);
    setFilteredExams(updatedExams);
    setDeleteFileModalVisible(false);
    resetForm();
    
    Alert.alert('Success', 'File deleted successfully!');
  };

  // Initialize update form with current exam data
  const initUpdateForm = (exam: PastExam) => {
    setCurrentExam(exam);
    setFormData({
      year: exam.year,
      term: exam.term,
      departmentId: exam.departmentId,
      courseCode: exam.courseCode,
      title: exam.title,
      examId: exam.id,
      fileId: '',
      fileName: ''
    });
    setUpdateModalVisible(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      year: '',
      term: '',
      departmentId: '',
      courseCode: '',
      title: '',
      examId: '',
      fileId: '',
      fileName: ''
    });
    setCurrentExam(null);
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Past Exams',
      }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for past exams..."
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
              <Text style={styles.managementButtonText}>Create Exam</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.managementButton}
              onPress={() => {
                resetForm();
                setDeleteModalVisible(true);
              }}
            >
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.managementButtonText}>Delete Exam</Text>
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
          
          {/* Exams List */}
          {filteredExams.map(exam => (
            <View key={exam.id} style={styles.card}>
              <View style={styles.examHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{exam.title}</Text>
                  <Text style={styles.courseInfo}>
                    {exam.courseCode} | {exam.departmentId} | {exam.term} {exam.year}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => initUpdateForm(exam)}
                >
                  <Ionicons name="pencil" size={20} color="#2196F3" />
                </TouchableOpacity>
              </View>
              
              {Array.isArray(exam.files) && exam.files.length > 0 && (
  <View style={styles.filesContainer}>
    <Text style={styles.filesHeader}>Exam Files:</Text>
    {exam.files.map(file => (
      <View key={file.id} style={styles.fileItem}>
        <Ionicons name="document" size={16} color="#2196F3" />
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.fileId}>ID: {file.id}</Text>
      </View>
    ))}
  </View>
)}

              <Text style={styles.examId}>Exam ID: {exam.id}</Text>
            </View>
          ))}
          
          {filteredExams.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No past exams found</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Create Exam Modal */}
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
                  <Text style={styles.modalTitle}>Create New Past Exam</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Year (e.g. 2023)"
                    value={formData.year}
                    onChangeText={(text) => setFormData({...formData, year: text})}
                    keyboardType="numeric"
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Term (Fall, Spring, Summer)"
                    value={formData.term}
                    onChangeText={(text) => setFormData({...formData, term: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Department ID"
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({...formData, departmentId: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Course Code"
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({...formData, courseCode: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Title (Course Name)"
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
                  />
                  
                  <TouchableOpacity 
                    style={styles.uploadFileButton}
                    onPress={() => {
                      Alert.alert('Upload', 'Exam file upload will be implemented');
                    }}
                  >
                    <Ionicons name="document-attach" size={20} color="#fff" />
                    <Text style={styles.uploadFileButtonText}>Upload Exam File</Text>
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
                      onPress={handleCreateExam}
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
      
      {/* Update Exam Modal */}
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
                  <Text style={styles.modalTitle}>Update Past Exam</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Year (e.g. 2023)"
                    value={formData.year}
                    onChangeText={(text) => setFormData({...formData, year: text})}
                    keyboardType="numeric"
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Term (Fall, Spring, Summer)"
                    value={formData.term}
                    onChangeText={(text) => setFormData({...formData, term: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Department ID"
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({...formData, departmentId: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Course Code"
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({...formData, courseCode: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Title (Course Name)"
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
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
                      onPress={handleUpdateExam}
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
      
      {/* Delete Exam Modal */}
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
                  <Text style={styles.modalTitle}>Delete Past Exam</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Exam ID"
                    value={formData.examId}
                    onChangeText={(text) => setFormData({...formData, examId: text})}
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
                      onPress={handleDeleteExam}
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
                  <Text style={styles.modalTitle}>Add File to Exam</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Exam ID"
                    value={formData.examId}
                    onChangeText={(text) => setFormData({...formData, examId: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="File Name (e.g. midterm2023.pdf)"
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
                  <Text style={styles.modalTitle}>Delete File from Exam</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Exam ID"
                    value={formData.examId}
                    onChangeText={(text) => setFormData({...formData, examId: text})}
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
  examHeader: {
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
  courseInfo: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: 'bold',
    marginBottom: 10,
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
  examId: {
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
}); 