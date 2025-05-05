import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ClassNotes() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Class Notes',
      }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Class Notes</Text>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Computer Science</Text>
            <Text style={styles.sectionContent}>
              • Introduction to Python{'\n'}
              • Data Structures and Algorithms{'\n'}
              • Object Oriented Programming{'\n'}
              • Web Development Fundamentals
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mathematics</Text>
            <Text style={styles.sectionContent}>
              • Calculus I{'\n'}
              • Calculus II{'\n'}
              • Linear Algebra{'\n'}
              • Differential Equations
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Engineering</Text>
            <Text style={styles.sectionContent}>
              • Circuit Analysis{'\n'}
              • Digital Logic Design{'\n'}
              • Signals and Systems{'\n'}
              • Control Systems
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