import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Communities() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Communities',
      }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Academic Clubs</Text>
            <Text style={styles.sectionContent}>
              • Computer Science Society{'\n'}
              • Engineers Without Borders{'\n'}
              • Math Club{'\n'}
              • Business Association
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Arts & Culture</Text>
            <Text style={styles.sectionContent}>
              • Photography Club{'\n'}
              • Music Society{'\n'}
              • Drama Club{'\n'}
              • Literature Association
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sports & Recreation</Text>
            <Text style={styles.sectionContent}>
              • Basketball Team{'\n'}
              • Soccer Club{'\n'}
              • Swimming Team{'\n'}
              • Chess Club
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Social Groups</Text>
            <Text style={styles.sectionContent}>
              • International Students Association{'\n'}
              • Volunteer Society{'\n'}
              • Debate Club{'\n'}
              • Environmental Awareness Group
            </Text>
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
}); 