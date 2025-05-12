import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authService } from './services/api';

// Neo-Brutalism Color Palette (Matching app design)
const colors = {
  background: '#FFD700', // Gold yellow (matching app pages)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
  primaryButtonBackground: '#1E90FF', // Buttons are Blue
  primaryButtonText: '#FFFFFF', // Button text is White
  inputBackground: '#FFFFFF', // Input background is White
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('1'); // Default to 1
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Check for minimum length
    if (password.length < 6) return 'Password must be at least 6 characters';
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    
    return null; // No error
  };

  const handleRegister = async () => {
    // Reset any previous errors
    setError('');

    // Basic validation
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending registration request to:', authService.getApiBaseUrl?.() || 'API URL not available');
      
      // Call API to register user
      await authService.register({
        departmentId: parseInt(departmentId),
        email,
        firstName,
        lastName,
        password
      });
      
      setIsLoading(false);
      
      // Show success message and navigate to login
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please login with your credentials.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      setIsLoading(false);
      console.error('Registration error:', error);
      
      if (error.message) {
        console.error('Error message:', error.message);
      }
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      // Handle API error responses
      if (error.response) {
        // The request was made and the server responded with an error status
        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else if (error.response.status === 409) {
          setError('Email is already registered');
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Check your connection and server status.');
      } else {
        // Something happened in setting up the request
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  const handleBack = () => {
    // Navigate back to login page
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBorder}>
              <Image 
                source={require('../assets/images/image.png')}
                style={styles.logo}
              />
              <Text style={styles.logoText}>UniSphere</Text>
            </View>
          </View>

          {/* Registration Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Register</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Department ID</Text>
              <TextInput
                style={styles.input}
                value={departmentId}
                onChangeText={setDepartmentId}
                placeholder="Enter your department ID"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleRegister}
              style={styles.registerButton}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    padding: 15,
    backgroundColor: colors.cardBackground,
    shadowColor: colors.border,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  formCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 24,
    shadowColor: colors.border,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: colors.text,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.primaryButtonBackground,
    paddingVertical: 15,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  registerButtonText: {
    color: colors.primaryButtonText,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Register; 