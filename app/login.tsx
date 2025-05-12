import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setError('');

    // Check if email is valid
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      await authService.login(email, password);
      
      // Handle successful login
      setIsLoading(false);
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle API error responses
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        if (error.response.status === 401) {
          setError('Invalid email or password');
        } else if (error.response.status === 403) {
          // 403 Forbidden typically means the account exists but isn't activated
          // or doesn't have the right permissions
          if (error.response.data?.error?.message) {
            setError(error.response.data.error.message);
          } else {
            setError('Account not activated or insufficient permissions');
          }
        } else {
          setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Check your connection.');
      } else {
        // Something happened in setting up the request
        setError('An error occurred. Please try again.');
      }
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    router.push('/forgotPassword');
  };

  const handleSignUp = () => {
    // Navigate to registration page
    router.push('/register');
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

          {/* Login Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Login</Text>
            
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
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
            
            <TouchableOpacity 
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleLogin}
              style={styles.loginButton}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Sign Up Section */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
              <Text style={styles.signUpLink}>Sign up</Text>
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
    marginBottom: 30,
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
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.primaryButtonBackground,
    fontWeight: 'bold',
  },
  loginButton: {
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
  loginButtonText: {
    color: colors.primaryButtonText,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: colors.text,
    fontSize: 16,
    marginRight: 5,
  },
  signUpLink: {
    color: colors.primaryButtonBackground,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login; 