import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

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
            <ActivityIndicator size="large" color="#2196F3" />
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
  },
  webview: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 