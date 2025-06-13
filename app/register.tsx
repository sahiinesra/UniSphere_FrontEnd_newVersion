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
  weak: '#FF4444',      // Red for weak password
  medium: '#FFA500',    // Orange for medium password
  strong: '#00C851',    // Green for strong password
  warning: '#FFE082',   // Light yellow for warning state
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasNoSpaces = !/\s/.test(password);

    let score = 0;
    let feedback = [];

    if (hasMinLength) {
      score++;
    } else {
      feedback.push('At least 8 characters');
    }

    if (hasUpperCase) {
      score++;
    } else {
      feedback.push('At least one uppercase letter');
    }

    if (hasSpecialChar) {
      score++;
    } else {
      feedback.push('At least one special character');
    }

    if (hasNumber) {
      score++;
    } else {
      feedback.push('At least one number');
    }

    if (!hasNoSpaces) {
      score = 0;
      feedback = ['Spaces are not allowed'];
    }

    return {
      score,
      feedback: feedback.join(', '),
    };
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(checkPasswordStrength(text));
    setPasswordsMatch(text === confirmPassword);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setPasswordsMatch(text === password);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
        return colors.weak;
      case 1:
        return colors.weak;
      case 2:
        return colors.medium;
      case 3:
        return colors.medium;
      case 4:
        return colors.strong;
      default:
        return colors.border;
    }
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength.score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
        return 'Medium';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 4) {
      setError('Password does not meet all the requirements');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.57:8080/api/v1/auth/register', {
        departmentId: 1,
        email,
        firstName,
        lastName,
        password
      });

      Alert.alert('Success', 'Registration successful! Please login with your credentials.');
      router.replace('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
      setError(message);
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
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  password.length > 0 && {
                    backgroundColor: passwordStrength.score < 4 ? colors.warning : colors.inputBackground,
                    borderColor: getPasswordStrengthColor(),
                  },
                ]}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
              />
              {password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthBars}>
                    <View style={[styles.strengthBar, { backgroundColor: passwordStrength.score >= 1 ? getPasswordStrengthColor() : '#E0E0E0' }]} />
                    <View style={[styles.strengthBar, { backgroundColor: passwordStrength.score >= 2 ? getPasswordStrengthColor() : '#E0E0E0' }]} />
                    <View style={[styles.strengthBar, { backgroundColor: passwordStrength.score >= 3 ? getPasswordStrengthColor() : '#E0E0E0' }]} />
                    <View style={[styles.strengthBar, { backgroundColor: passwordStrength.score >= 4 ? getPasswordStrengthColor() : '#E0E0E0' }]} />
                  </View>
                  <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                    {getPasswordStrengthLabel()}
                  </Text>
                  {passwordStrength.feedback ? (
                    <Text style={styles.feedbackText}>
                      Required: {passwordStrength.feedback}
                    </Text>
                  ) : (
                    <Text style={[styles.feedbackText, { color: colors.strong }]}>
                      All requirements met!
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword.length > 0 && {
                    backgroundColor: !passwordsMatch ? colors.warning : colors.inputBackground,
                    borderColor: passwordsMatch ? colors.strong : colors.weak,
                  },
                ]}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry
              />
              {confirmPassword.length > 0 && (
                <Text
                  style={[
                    styles.feedbackText,
                    {
                      color: passwordsMatch ? colors.strong : colors.weak,
                      marginTop: 4,
                    },
                  ]}
                >
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              style={styles.registerButton}
              activeOpacity={0.7}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
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
    marginTop: 10,
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
    marginBottom: 20,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
});

export default Register; 