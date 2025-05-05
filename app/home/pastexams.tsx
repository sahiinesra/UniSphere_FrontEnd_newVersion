import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PastExams() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Past Exams',
      }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Past Exams</Text>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fall 2023</Text>
            <Text style={styles.sectionContent}>
              • Computer Science Midterm{'\n'}
              • Data Structures Final{'\n'}
              • Algorithms Quiz 1{'\n'}
              • Database Systems Project
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Spring 2023</Text>
            <Text style={styles.sectionContent}>
              • Software Engineering Midterm{'\n'}
              • Web Development Final{'\n'}
              • Mobile Development Quiz 2{'\n'}
              • Computer Networks Project
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fall 2022</Text>
            <Text style={styles.sectionContent}>
              • Introduction to Programming Midterm{'\n'}
              • Object Oriented Programming Final{'\n'}
              • Computer Architecture Quiz 1{'\n'}
              • Operating Systems Project
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