import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';

// FlatList reference:
// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge

// Uses Read logic from PGA Dashboard


// Define the structure of a Lesson object with properties matching your updated database schema
interface Lesson {
  feedback: string;
  drillsAssigned: string;
  GolferID: string;
  PGAID: string;
  area: string;
  competency: string;
  confidence: number;
  focusPoints: string;
  beforeImage: string | null; // Image URLs can be null if not provided
  afterImage: string | null;
  created_at: string;
}

// Component to view lessons
export default function ViewLessonsPGA() {
  const [lessons, setLessons] = useState<Lesson[]>([]); // State to store the lessons
  const [loading, setLoading] = useState(true); // State to indicate loading

  // Function to fetch lessons from the database
  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('Lesson')
        .select('*'); 

      if (error) {
        console.error('Error fetching lessons:', error.message);
        Alert.alert('Error fetching lessons', error.message);
        return;
      }

      console.log('Fetched lessons:', data); // Debugging log to verify fetched data
      setLessons(data as Lesson[]); // Set lessons to state
    } catch (error) {
      console.error('Unexpected error fetching lessons:', error);
      Alert.alert('Error', 'Unexpected error fetching lessons');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // useEffect to fetch lessons when component mounts
  useEffect(() => {
    fetchLessons();
  }, []);

  // Function to render each lesson in the list
  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.lessonText}>Feedback: {item.feedback}</Text>
      <Text style={styles.lessonText}>Drills Assigned: {item.drillsAssigned}</Text>
      <Text style={styles.lessonText}>Area of Game: {item.area}</Text>
      <Text style={styles.lessonText}>Competency Level: {item.competency}</Text>
      <Text style={styles.lessonText}>Confidence Level: {item.confidence}</Text>
      <Text style={styles.lessonText}>Focus Points: {item.focusPoints}</Text>
      <Text style={styles.lessonText}>Golfer ID: {item.GolferID}</Text>
      <Text style={styles.lessonText}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>

      {/* Display Before and After images if available */}
      {item.beforeImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Before Picture:</Text>
          <Image source={{ uri: item.beforeImage }} style={styles.image} />
        </View>
      )}
      {item.afterImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>After Picture:</Text>
          <Image source={{ uri: item.afterImage }} style={styles.image} />
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <Text style={styles.header}>View Lessons</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.GolferID + item.created_at} // Unique key for each item
          renderItem={renderLesson}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No lessons found.</Text>} // Message when list is empty
        />
      )}
    </LinearGradient>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textGreen,
    marginBottom: 20,
  },
  lessonCard: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: colors.borderGray,
    borderWidth: 1,
  },
  lessonText: {
    fontSize: 16,
    color: colors.textGreen,
    marginBottom: 5,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: colors.borderGray,
    marginTop: 20,
  },
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    color: colors.textGreen,
    marginBottom: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
  },
});