import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Neo-Brutalism Color Palette (Updated for Yellow Background & Blue Buttons)
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',      // Text is Black for contrast
  border: '#000000',      // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
  primaryButtonBackground: '#1E90FF', // Buttons are now Blue
  primaryButtonText: '#FFFFFF', // Button text is now White
};

// Custom Button Component (Neo-Brutalism style - Blue)
interface NeoButtonProps {
  title: string;
  onPress: () => void;
}

const NeoButton: React.FC<NeoButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.buttonBase}
      onPress={onPress}
      activeOpacity={0.7} // Adjust opacity for press feedback
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Welcome Message */}
          <Text style={styles.welcomeText}>
            Welcome to UniSphere!{'\n'}Ankara Science University
          </Text>

          {/* Brutalist Separator Line */}
          <View style={styles.separatorLine}></View>

          {/* About Ankara Science University */}
          {/* Card background is white */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About Ankara Science University</Text>
            <Text style={styles.sectionContent}>
              Ankara Science University is a leading institution in Turkey known
              for its cutting-edge research and high-quality education in
              various fields of study.
            </Text>
          </View>

          {/* About UniSphere */}
          {/* Card background is white */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About UniSphere</Text>
            <Text style={styles.sectionContent}>
              UniSphere is a university social platform designed to connect
              students, share lecture notes, and foster academic
              collaboration.
            </Text>
          </View>

          {/* Buttons Section - Now Blue */}
          <View style={styles.buttonContainer}>
            {/* Each button is pressable due to TouchableOpacity */}
            <NeoButton 
              title="Past Exams" 
              onPress={() => {
                // Standard push navigation
                router.push("/home/pastexams");
              }} 
            />
            <NeoButton 
              title="Class Notes" 
              onPress={() => {
                // Standard push navigation
                router.push("/home/classnotes");
              }} 
            />
            <NeoButton 
              title="Campus Map" 
              onPress={() => {
                // Standard push navigation
                router.push("/home/campusmap");
              }} 
            />
            <NeoButton 
              title="Communities" 
              onPress={() => {
                // Standard push navigation
                router.push("/home/communities");
              }} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 15,
    fontFamily: 'System',
  },
  separatorLine: {
    height: 5,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: 40,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 25,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 15,
  },
  buttonBase: {
    backgroundColor: colors.primaryButtonBackground,
    padding: 15,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.primaryButtonText,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});