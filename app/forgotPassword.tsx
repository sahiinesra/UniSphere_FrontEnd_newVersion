import axios from 'axios';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://192.168.0.22:8080/api/v1/auth/forgot-password', {
        email: email.trim()
      });

      Alert.alert(
        'Success',
        'If an account exists with this email, you will receive a password reset link.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          Alert.alert(
            'Connection Timeout',
            'The server is taking too long to respond. Please check your internet connection and try again.'
          );
        } else if (!error.response) {
          Alert.alert(
            'Network Error',
            'Unable to connect to the server. Please check your internet connection.'
          );
        } else {
          Alert.alert('Error', error.response?.data?.message || 'Failed to send reset email');
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
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

          {/* Forgot Password Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Forgot Password</Text>
            <Text style={styles.formSubtitle}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
            
            <TouchableOpacity 
              onPress={handleResetPassword}
              style={[
                styles.resetButton,
                isLoading && styles.disabledButton
              ]}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 50,
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
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  formSubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: colors.primaryButtonBackground,
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    marginBottom: 16,
  },
  resetButtonText: {
    color: colors.primaryButtonText,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    color: colors.primaryButtonBackground,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ForgotPassword; 