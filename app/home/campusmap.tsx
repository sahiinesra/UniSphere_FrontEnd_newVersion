import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CampusMap() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Campus Map',
      }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Campus Map</Text>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Main Campus</Text>
            <Text style={styles.sectionContent}>
              • Administration Building{'\n'}
              • Faculty of Engineering{'\n'}
              • Faculty of Business{'\n'}
              • Library
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>North Campus</Text>
            <Text style={styles.sectionContent}>
              • Faculty of Sciences{'\n'}
              • Research Center{'\n'}
              • Laboratories{'\n'}
              • Dormitories
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>South Campus</Text>
            <Text style={styles.sectionContent}>
              • Faculty of Arts{'\n'}
              • Auditorium{'\n'}
              • Sports Center{'\n'}
              • Cafeteria
            </Text>
          </View>
          
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Interactive Map Coming Soon</Text>
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
    paddingBottom: 5,
  },
  sectionContent: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
}); 