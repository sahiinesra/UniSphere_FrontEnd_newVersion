import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import StaticTabBar from '../../components/StaticTabBar';

export default function HomeLayout() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFF00',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#FFFF00',
            paddingBottom: 75, // Space for tab bar
          },
          // Custom back button that always goes to home tab
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)')}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Fixed Bottom Tab Bar */}
      <View style={styles.tabBarContainer}>
        <StaticTabBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
}); 