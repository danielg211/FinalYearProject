import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

// This code is adapted from Zero Degree Coder's video on creating a Signup, Login, and Welcome Screen in React Native
// Video reference: Zero Degree Coder. "Signup, Login, Welcome Screen React Native." YouTube, https://www.youtube.com/watch?v=eu-8OlWbwjA
// Utilizes navigation functionalities and styles

// Define the navigation type for MainDashboard
type PGAHomeNavigationProp = StackNavigationProp<RootStackParamList, 'PGAHome'>;

// PGAHome component
export default function PGAHome() {
  const navigation = useNavigation<PGAHomeNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Golf IQ Pro</Text>
      <Text style={styles.subtitle}>Choose a section to get started</Text>

      {/* Navigate to Golfer Management */}
      <Button
        title="Golfer Management"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('PGADashboard')}
      />

      {/* Navigate to Log Lesson */}
      <Button
        title="Log a Lesson"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('LogLesson')}
        containerStyle={styles.buttonContainer}
      />

      {/* Navigate to View Lessons */}
      <Button
        title="View Lessons"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('ViewLessonsPGA')}
        containerStyle={styles.buttonContainer}
      />

      {/* Navigate to Create Drills */}
      <Button
        title="Create Drills"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('CreateDrills')}
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
}

// Styles for the PGAHome component Chatgpt
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 30,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 15,
    paddingVertical: 10,
    width: '80%',
  },
  buttonContainer: {
    marginTop: 15,
  },
});
