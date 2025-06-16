import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
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

// Define types for our data
interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
}

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
  fileIds: string[];
  instructorId: number;
  content: string;
}

interface FormData {
  year: string;
  term: string;
  departmentId: string;
  courseCode: string;
  title: string;
  examId: string;
}


export default function PastExams() {
  const [exams, setExams] = useState<PastExam[]>([]);
  const [filteredExams, setFilteredExams] = useState<PastExam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  // UI Modals
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  // Form states
  const [currentExam, setCurrentExam] = useState<PastExam | null>(null);
  const [formData, setFormData] = useState<FormData>({
    year: '',
    term: '',
    departmentId: '',
    courseCode: '',
    title: '',
    examId: ''
  });

  // Fetch user profile to get role
  const fetchUserProfile = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await axios.get(
        'http://10.200.0.156:8080/api/v1/users/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('User Profile Response:', response.data);
      const userData = response.data.data;
      setUserRole(userData.role);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const loadExams = async () => {
    const data = await fetchPastExams();
    setExams(data);
    setFilteredExams(data);
  };

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing past exams...');
      loadExams();
    }, [])
  );

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text) {
      const searchText = text.toLowerCase();
      const filtered = exams.filter(exam =>
        (exam.title?.toLowerCase() || '').includes(searchText) ||
        (exam.courseCode?.toLowerCase() || '').includes(searchText) ||
        (exam.term?.toLowerCase() || '').includes(searchText) ||
        (exam.year?.toString() || '').includes(searchText) ||
        (exam.departmentId?.toString() || '').toLowerCase().includes(searchText)
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
        `http://10.200.0.156:8080/api/v1/past-exams`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const pastExams = response.data.data.pastExams.map((exam: any) => ({
        ...exam,
        files: exam.files || []
      }));

      console.log('Processed Past Exams:', JSON.stringify(pastExams, null, 2));
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

      // Create form data for multipart request
      const formDataObj = new FormData();
      formDataObj.append('year', formData.year);
      formDataObj.append('term', formData.term);
      formDataObj.append('departmentId', formData.departmentId);
      formDataObj.append('courseCode', formData.courseCode);
      formDataObj.append('title', formData.title);

      // Append file if selected
      if (selectedFile) {
        formDataObj.append('files', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name,
        } as any);
      }

      const response = await axios.post(
        'http://10.200.0.156:8080/api/v1/past-exams',
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Create exam response:', JSON.stringify(response.data, null, 2));

      // Immediately fetch the updated list of exams
      const updatedExamsList = await fetchPastExams();
      setExams(updatedExamsList);
      setFilteredExams(updatedExamsList);
      
      setCreateModalVisible(false);
      setSelectedFile(null);
      resetForm();

      Alert.alert('Success', 'Exam created successfully!');
    } catch (error: any) {
      console.error('Create exam error:', error.response?.data || error.message);
      Alert.alert('Error', 'An error occurred while creating the exam.');
    }
  };

  const handleUpdateExam = async () => {
    if (!currentExam) {
      Alert.alert('Error', 'No exam selected for update.');
      return;
    }
  
    try {
      const token = await getAccessToken();
  
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return;
      }
  
      const response = await axios.put(
        `http://10.200.0.156:8080/api/v1/past-exams/${currentExam.id}`,
        {
          year: parseInt(formData.year, 10),
          term: formData.term,
          departmentId: parseInt(formData.departmentId, 10),
          courseCode: formData.courseCode,
          title: formData.title,
          fileIds: currentExam.fileIds || [],
          instructorId: currentExam.instructorId || 0,
          content: currentExam.content || "", // Send empty string if not editable
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const updatedExam = response.data.data;
  
      const updatedExams = exams.map((exam) =>
        exam.id === updatedExam.id ? updatedExam : exam
      );
  
      setExams(updatedExams);
      setFilteredExams(updatedExams);
      setUpdateModalVisible(false);
      resetForm();
  
      Alert.alert('Success', 'Exam updated successfully!');
    } catch (error: any) {
      console.error('Update exam error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update exam.');
    }
  };
  

  // Handle delete exam
  const handleDeleteExam = async (examId: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        Alert.alert('Error', 'JWT token not found.');
        return;
      }

      await axios.delete(
        `http://10.200.0.156:8080/api/v1/past-exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Close the delete modal first
      setDeleteModalVisible(false);
      setCurrentExam(null);

      // Then fetch fresh data
      const updatedExamsList = await fetchPastExams();
      setExams(updatedExamsList);
      setFilteredExams(updatedExamsList);

      Alert.alert('Success', 'Exam deleted successfully!');
    } catch (error: any) {
      console.error('Delete exam error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to delete exam.');
    }
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
      examId: exam.id
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
      examId: ''
    });
    setCurrentExam(null);
  };

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
          'http://10.200.0.156:8080',
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

  return (
    <>
      <Stack.Screen options={{
        title: 'Past Exams',
      }} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="#000" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by course code, title, term, year..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#666"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setFilteredExams(exams);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Management Buttons - Only visible to instructors */}
          {userRole === 'INSTRUCTOR' && (
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
                <Text style={styles.managementButtonText}>Delete Exam</Text>
              </TouchableOpacity>
            </View>
          )}

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
                {userRole === 'INSTRUCTOR' && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => initUpdateForm(exam)}
                  >
                    <Ionicons name="pencil" size={20} color="#2196F3" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.filesContainer}>
                <Text style={styles.filesHeader}>Exam Files:</Text>
                {exam.fileIds && exam.fileIds.length > 0 ? (
                  exam.fileIds.map(fileId => (
                    <TouchableOpacity
                      key={fileId}
                      style={styles.fileItem}
                      onPress={() => handleFileOpen(fileId)}
                    >
                      <Ionicons name="document-text-outline" size={24} color="#2196F3" />
                      <Text style={styles.fileName}>Exam Document</Text>
                      <Text style={styles.fileId}>ID: {fileId}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noFilesText}>No files uploaded</Text>
                )}
              </View>

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

                  <Text style={styles.inputLabel}>Year (e.g. 2023)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>Term (FALL or SPRING)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.term}
                    onChangeText={(text) => setFormData({ ...formData, term: text })}
                  />

                  <Text style={styles.inputLabel}>Department ID (e.g. 1 for Computer Science)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({ ...formData, departmentId: text })}
                  />

                  <Text style={styles.inputLabel}>Course Code (e.g. CS101)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({ ...formData, courseCode: text })}
                  />

                  <Text style={styles.inputLabel}>Exam Title (e.g. Introduction to Programming Midterm 1)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                  />

                  <TouchableOpacity
                    style={styles.uploadFileButton}
                    onPress={handleFilePick}
                  >
                    <Ionicons name="document-attach" size={20} color="#fff" />
                    <Text style={styles.uploadFileButtonText}>
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload Exam File'}
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

                  <Text style={styles.inputLabel}>Year (e.g. 2023)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>Term (Fall, Spring, Summer)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.term}
                    onChangeText={(text) => setFormData({ ...formData, term: text })}
                  />

                  <Text style={styles.inputLabel}>Department ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.departmentId}
                    onChangeText={(text) => setFormData({ ...formData, departmentId: text })}
                  />

                  <Text style={styles.inputLabel}>Course Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.courseCode}
                    onChangeText={(text) => setFormData({ ...formData, courseCode: text })}
                  />

                  <Text style={styles.inputLabel}>Title (Course Name)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
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

                  <Text style={styles.inputLabel}>Exam ID (You can find this at the bottom of each exam card)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={formData.examId}
                    onChangeText={(text) => setFormData({ ...formData, examId: text })}
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
                      onPress={() => handleDeleteExam(formData.examId)}
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
    color: '#000000',
  },
  searchIcon: {
    marginRight: 10,
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
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 15,
  },
  filesHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileName: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  fileId: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 'auto',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noFilesText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  clearButton: {
    padding: 5,
  },
}); 