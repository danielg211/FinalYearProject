import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

type LessonDetailsProps = {
  route: { params: { lessonId: string } };
};

export default function LessonDetailsGolfer({ route }: LessonDetailsProps) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('Lesson1')
          .select('*') // Fetch all columns for the lesson
          .eq('Lessonid', lessonId)
          .single();

        if (error) throw error;

        setLesson(data);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch lesson details.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [lessonId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text>No lesson details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson Details</Text>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>{new Date(lesson.created_at).toLocaleDateString()}</Text>
      <Text style={styles.label}>Feedback:</Text>
      <Text style={styles.value}>{lesson.feedback}</Text>
      <Text style={styles.label}>Area of Game:</Text>
      <Text style={styles.value}>{lesson.area}</Text>
      <Text style={styles.label}>Confidence:</Text>
      <Text style={styles.value}>{lesson.confidence}</Text>
      <Text style={styles.label}>Drills Assigned:</Text>
      <Text style={styles.value}>{lesson.drillsAssigned || 'None'}</Text>
      {/* Add more fields as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});
