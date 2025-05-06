import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Define colors to match the application theme
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  accent: '#2196F3',     // Blue accent
};

export default function CampusMap() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Campus Map',
      }} />
      
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading Map...</Text>
          </View>
        )}
        
        <WebView
          source={{ uri: "https://yandex.com.tr/profile/55049255478?lang=tr&no-distribution=1&view-state=mini&source=wizbiz_new_map_single" }}
          style={styles.webview}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
}); 