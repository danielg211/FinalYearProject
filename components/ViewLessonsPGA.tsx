import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';

// FlatList reference:
// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge

// Uses Read logic from PGA Dashboard


interface Lesson {
  feedback: string;
  drillsAssigned: string;
  GolferID: string;
  PGAID: string;
  area: string;
  competency: string;
  confidence: number;
  focusPoints: string;
  beforeImage: string | null;
  afterImage: string | null;
  created_at: string;
}

interface Golfer {
  GolferID: string;
  name: string;
}

export default function ViewLessonsPGA() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [selectedGolfer, setSelectedGolfer] = useState<string>(''); // State to track selected golfer
  const [loading, setLoading] = useState(true);

  // Fetch lessons from the database
  const fetchLessons = async (golferId: string | null = null) => {
    try {
      let query = supabase
        .from('Lesson')
        .select(`
          feedback, drillsAssigned, GolferID, PGAID, area, competency, confidence, focusPoints, beforeImage, afterImage, created_at
        `)
        .order('created_at', { ascending: false });

      if (golferId) {
        query = query.eq('GolferID', golferId); // Filter by selected golfer
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lessons:', error.message);
        Alert.alert('Error fetching lessons', error.message);
        return;
      }

      setLessons(data as Lesson[]);
    } catch (error) {
      console.error('Unexpected error fetching lessons:', error);
      Alert.alert('Error', 'Unexpected error fetching lessons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch golfers from the database
  const fetchGolfers = async () => {
    try {
      const { data, error } = await supabase.from('golfers').select('GolferID, name');

      if (error) {
        console.error('Error fetching golfers:', error.message);
        Alert.alert('Error fetching golfers', error.message);
        return;
      }

      setGolfers(data || []);
    } catch (error) {
      console.error('Unexpected error fetching golfers:', error);
      Alert.alert('Error', 'Unexpected error fetching golfers');
    }
  };

  useEffect(() => {
    fetchGolfers(); // Fetch golfers when the component mounts
    fetchLessons(); // Fetch all lessons when the component mounts
  }, []);

  useEffect(() => {
    // Fetch lessons for the selected golfer whenever it changes
    fetchLessons(selectedGolfer || null);
  }, [selectedGolfer]);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.lessonText}>Feedback: {item.feedback}</Text>
      <Text style={styles.lessonText}>Drills Assigned: {item.drillsAssigned}</Text>
      <Text style={styles.lessonText}>Area of Game: {item.area}</Text>
      <Text style={styles.lessonText}>Competency Level: {item.competency}</Text>
      <Text style={styles.lessonText}>Confidence Level: {item.confidence}</Text>
      <Text style={styles.lessonText}>Focus Points: {item.focusPoints}</Text>
      <Text style={styles.lessonText}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <Text style={styles.header}>View Lessons</Text>

      {/* Golfer Picker */}
      <RNPickerSelect
        onValueChange={(value) => setSelectedGolfer(value)}
        items={golfers.map((golfer) => ({
          label: golfer.name,
          value: golfer.GolferID,
        }))}
        placeholder={{ label: 'Select Golfer', value: '' }}
        style={pickerSelectStyles}
        value={selectedGolfer}
      />

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.GolferID + item.created_at}
          renderItem={renderLesson}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No lessons found.</Text>}
        />
      )}
    </LinearGradient>
  );
}

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
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 8,
    color: colors.textGreen,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 8,
    color: colors.textGreen,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
};
