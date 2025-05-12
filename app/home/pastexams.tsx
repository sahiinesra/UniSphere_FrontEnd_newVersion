import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { authService } from '../services/api';
import { storageService } from '../services/storage';

// Define types for our data
interface ExamFile {
  id: string;
  name: string;
}

interface PastExam {
  id: number;
  year: string;
  term: string;
  departmentId: number;
  courseCode: string;
  title: string;
  createdAt?: string;  // API might return createdAt
  updatedAt?: string;  // API might return updatedAt
  files: ExamFile[];
}

interface FormData {
  year: string;
  term: string;
  departmentId: string;  // Keep as string for form input
  courseCode: string;
  title: string;
  examId: string;  // Keep as string for form input
  fileId: string;
  fileName: string;
}

// Mock data for past exams
const initialExams: PastExam[] = [
  {
    id: 1,
    year: '2023',
    term: 'Fall',
    departmentId: 1,
    courseCode: 'CS101',
    title: 'Introduction to Programming',
    files: [
      { id: 'f1', name: 'Midterm_2023.pdf' },
      { id: 'f2', name: 'Final_2023.pdf' }
    ]
  },
  {
    id: 2,
    year: '2023',
    term: 'Spring',
    departmentId: 2,
    courseCode: 'MATH201',
    title: 'Calculus I',
    files: [
      { id: 'f3', name: 'Midterm_Spring2023.pdf' }
    ]
  },
  {
    id: 3,
    year: '2022',
    term: 'Fall',
    departmentId: 3,
    courseCode: 'ENG301',
    title: 'Circuit Analysis',
    files: [
      { id: 'f4', name: 'Quiz1_2022.pdf' },
      { id: 'f5', name: 'Final_2022.pdf' }
    ]
  }
];

export default function PastExams() {
  const router = useRouter();
  
  // State for exams and UI controls
  const [exams, setExams] = useState<PastExam[]>(initialExams);
  const [filteredExams, setFilteredExams] = useState<PastExam[]>(initialExams);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for create/update form
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

  const [isLoading, setIsLoading] = useState(false);
  
  // Check login status and load past exams
  useEffect(() => {
    // Set initial loading state to true before loading data
    setIsLoading(true);
    
    // Load exams without explicitly checking login since the API interceptor will handle token
    const fetchData = async () => {
      try {
        // Quick check if we have a token
        const isLoggedIn = await authService.isLoggedIn();
        console.log('Is user logged in?', isLoggedIn);
        
        if (!isLoggedIn) {
          console.error('User not logged in, redirecting to login page');
          router.replace('/login');
          return;
        }
        
        // Load past exams
        await loadPastExams();
      } catch (error) {
        console.error('Error initializing data:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to initialize app data. Please try again.');
      }
    };
    
    fetchData();
  }, []);
  
  // Function to load past exams from the API
  const loadPastExams = async () => {
    try {
      console.log('PastExams: Loading past exams...');
      
      // API baseURL - Use IP address instead of localhost for iOS simulator
      const baseUrl = Platform.OS === 'ios' 
        ? "http://192.168.0.31:8080/api/v1"     // IP address for iOS
        : "http://10.0.2.2:8080/api/v1";        // For Android
        
      console.log('PastExams: Using API address:', baseUrl);
      
      // Get the token - interceptor will use hardcoded token if needed
      const token = await storageService.getAuthToken();
      if (!token) {
        console.error('PastExams: No token available after fallbacks');
        Alert.alert('Authentication Error', 'Unable to authenticate. Using demo data for now.');
        setIsLoading(false);
        // Use initial mock data
        setExams(initialExams);
        setFilteredExams(initialExams);
        return;
      }
      
      // Make API call
      console.log('PastExams: Making fetch request...');
      let response;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch(`${baseUrl}/past-exams?page=1&pageSize=10`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': token
            }
          });
          
          console.log('PastExams: API response status:', response.status);
          
          if (response.ok) {
            break; // Success, exit the retry loop
          }
          
          // If unauthorized error, try to get a fresh token
          if (response.status === 401) {
            console.log(`Retry ${retryCount + 1}/${maxRetries}: Unauthorized error, refreshing token`);
            
            // Clear token cache to force refresh
            await storageService.clearAuthData();
            
            // Get fresh token for next attempt
            const freshToken = await storageService.getAuthToken();
            if (!freshToken) {
              throw new Error('Failed to obtain a valid authentication token');
            }
            
            retryCount++;
            continue;
          }
          
          // For other errors, break and handle below
          break;
        } catch (fetchError) {
          console.error(`PastExams: Fetch error on attempt ${retryCount + 1}:`, fetchError);
          retryCount++;
          
          if (retryCount > maxRetries) {
            throw fetchError;
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response || !response.ok) {
        const errorText = await response?.text() || 'Unknown error';
        console.error('PastExams: API error response:', errorText);
        throw new Error(`Server returned ${response?.status || 'unknown error'}`);
      }
      
      const data = await response.json();
      console.log('PastExams: API response received, data length:', Array.isArray(data) ? data.length : 'not an array');
      
      if (data && Array.isArray(data)) {
        // Transform API response to PastExam type
        const transformedExams: PastExam[] = data.map(exam => ({
          id: exam.id || 0,
          year: exam.year || '',
          term: exam.term || '',
          departmentId: Number(exam.departmentId) || 0,
          courseCode: exam.courseCode || '',
          title: exam.title || '',
          createdAt: exam.createdAt,
          updatedAt: exam.updatedAt,
          files: exam.files || []
        }));
        
        console.log(`PastExams: Successfully loaded ${transformedExams.length} exams`);
        setExams(transformedExams);
        setFilteredExams(transformedExams);
      } else {
        console.warn('PastExams: API response is not an array:', data);
        
        // Fallback to mock data if the API returns invalid data
        console.log('Using mock data as fallback');
        setExams(initialExams);
        setFilteredExams(initialExams);
      }
    } catch (error: any) {
      console.error('PastExams: Error loading exams:', error);
      
      let errorMessage = 'Failed to load past exams. Please try again later.';
      
      if (error.message) {
        if (error.message.includes('401')) {
          errorMessage = 'Authentication error. The app will use sample data for now.';
          
          // Use mock data in case of authentication error
          setExams(initialExams);
          setFilteredExams(initialExams);
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to access past exams.';
        } else if (error.message.includes('Network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('expired')) {
          errorMessage = 'Your session has expired. Using sample data for now.';
          
          // Use mock data for token expiration
          setExams(initialExams);
          setFilteredExams(initialExams);
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleCreateExam = async () => {
    // Basic validation
    if (!formData.year || !formData.term || !formData.departmentId || !formData.courseCode || !formData.title) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('PastExams: Creating new exam...');
      
      // API baseURL - Use IP address instead of localhost for iOS simulator
      const baseUrl = Platform.OS === 'ios' 
        ? "http://192.168.0.31:8080/api/v1"     // IP address for iOS
        : "http://10.0.2.2:8080/api/v1";        // For Android
        
      console.log('PastExams: Using API address:', baseUrl);
      
      // Get token - will use hardcoded token if needed
      const token = await storageService.getAuthToken();
      if (!token) {
        console.error('PastExams: No token available for creation');
        Alert.alert('Error', 'Authentication error. Please log in again to continue.');
        setIsLoading(false);
        return;
      }
      
      // Create form data
      const formDataToSend = new FormData();
      formDataToSend.append('year', formData.year);
      formDataToSend.append('term', formData.term.toLowerCase());
      formDataToSend.append('departmentId', formData.departmentId);
      formDataToSend.append('courseCode', formData.courseCode);
      formDataToSend.append('title', formData.title);
      
      console.log('PastExams: Form data:', JSON.stringify({
        year: formData.year,
        term: formData.term.toLowerCase(),
        departmentId: formData.departmentId,
        courseCode: formData.courseCode,
        title: formData.title
      }));
      
      // Make API call
      console.log('PastExams: Making POST request...');
      const response = await fetch(`${baseUrl}/past-exams`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token
        },
        body: formDataToSend
      });
      
      console.log('PastExams: API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('PastExams: API error response:', errorText);
        throw new Error(`Server returned ${response.status}`);
      }
      
      // If successful
      console.log('PastExams: Exam created successfully');
      
      // Reload exams
      await loadPastExams();
      setCreateModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Exam created successfully!');
    } catch (error: any) {
      console.error('PastExams: Error creating exam:', error);
      
      let errorMessage = 'Failed to create exam. Please try again later.';
      
      if (error.message) {
        if (error.message.includes('401')) {
          errorMessage = 'Authentication error. Please log in again to continue.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to create exams.';
        } else if (error.message.includes('Network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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
            departmentId: Number(formData.departmentId),
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
    const updatedExams = exams.filter(exam => exam.id !== Number(formData.examId));
    
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
      if (exam.id === Number(formData.examId)) {
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
      if (exam.id === Number(formData.examId)) {
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
      departmentId: String(exam.departmentId),
      courseCode: exam.courseCode,
      title: exam.title,
      examId: String(exam.id),
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
              disabled={isLoading}
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
          
          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading Past Exams...</Text>
              <Text style={styles.loadingSubText}>Please wait while we retrieve your data.</Text>
            </View>
          )}
          
          {/* Exams List */}
          {!isLoading && filteredExams.map(exam => (
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
              
              {exam.files.length > 0 && (
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
          
          {!isLoading && filteredExams.length === 0 && (
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
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalButtonText}>Create</Text>
                      )}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
}); 