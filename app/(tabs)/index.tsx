import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
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

// Interface for User Profile Data (to be fetched from backend)
interface UserProfile {
  name: string;
  faculty: string;
  email: string;
  imageUrl: string;
}

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
  
  // State for holding profile data
  const [profile, setProfile] = useState<UserProfile>({
    // Initial placeholder data - will be replaced by backend data
    name: 'Loading...',
    faculty: 'Loading...',
    email: 'Loading...',
    imageUrl: 'https://via.placeholder.com/100/cccccc/000000?text=...', // Placeholder image
  });

  // useEffect to fetch data when the component mounts
  useEffect(() => {
    // --- Placeholder for Backend Fetch ---
    // In a real application, you would fetch data here, e.g.:
    // fetch('/api/user/profile')
    //   .then(response => response.json())
    //   .then((data: UserProfile) => setProfile(data))
    //   .catch(error => {
    //     console.error("Error fetching profile:", error);
    //     // Handle error state if needed
    //     setProfile({
    //         name: 'Error Loading',
    //         faculty: 'Could not fetch data',
    //         email: '',
    //         imageUrl: 'https://via.placeholder.com/100/ff0000/ffffff?text=Error', // Error placeholder
    //     });
    //   });

    // Simulating a network request delay with setTimeout
    const timer = setTimeout(() => {
      setProfile({
        name: 'Esra Sahin', // Data loaded from "backend"
        faculty: 'Faculty of Engineering and Architecture', // Data loaded
        email: 's200101@ankarabilim.edu.tr', // Data loaded
        imageUrl: '', // Changed to a specific image
      });
    }, 1500); // Simulate 1.5 second load time

    return () => clearTimeout(timer); // Cleanup timer on component unmount
    // --- End Placeholder ---
  }, []); // Empty dependency array means this runs once on mount

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

          {/* Profile Section - Uses state data */}
          {/* Card background is white */}
          <View style={styles.card}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: profile.imageUrl }} // Use image URL from state
                  style={styles.profileImage}
                  resizeMode="cover" // Ensure image covers the area
                />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileInfo}>{profile.faculty}</Text>
                <Text style={styles.profileInfo}>{profile.email}</Text>
              </View>
            </View>
          </View>

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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: colors.border,
    marginRight: 15,
    padding: 0,
    backgroundColor: '#ccc',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileInfo: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    paddingBottom: 5,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  // Custom Button Styles - Blue Background, White Text
  buttonBase: {
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
  buttonText: {
    color: colors.primaryButtonText,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
