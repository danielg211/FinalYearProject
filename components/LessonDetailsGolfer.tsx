import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

type LessonDetailsProps = {
  route: { params: { lessonId: string } };
};

// FlatList reference:
// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge
// CRUD Reference

// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU
// Uses Read logic from PGA Dashboard

// SupaBase Docs on Javascript https://supabase.com/docs/reference/javascript/select

// Expo Docs Video Player https://docs.expo.dev/versions/latest/sdk/video-av/

// React Native Docs Display Image https://reactnative.dev/docs/image

// Learn to Use React-Native-Picker-Select in 5 Minutes! https://www.youtube.com/watch?v=9MhLUaHY6M4 by Technical Rajni

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
      {}
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
