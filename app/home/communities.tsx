import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Define colors to match the application theme
const colors = {
  background: '#FFD700', // Gold yellow (matching AI page)
  text: '#000000',       // Text is Black for contrast
  border: '#000000',     // Borders are Black
  cardBackground: '#FFFFFF', // Card interiors are White
};

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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Add extra padding for bottom tabs
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 20,
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
    elevation: 5,
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
}); 