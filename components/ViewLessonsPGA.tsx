import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';
import { Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import jsPDF from 'jspdf';
import * as FileSystem from 'expo-file-system';

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



interface Lesson {
  feedback: string;
  GolferID: string;
  PGAID: string;
  area: string;
  competency: string;
  confidence: number;
  beforeImage: string | null;
  afterImage: string | null;
  beforeVideo: string | null;
  afterVideo: string | null;
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

  /* Fetch lessons from the database // used chatgpt to help filter by constraint selected golferid
  const fetchLessons = async (golferId: string | null = null) => {
    try {
      let query = supabase
        .from('Lesson1')
        .select(`
          feedback, GolferID, PGAID, area, competency, confidence, beforeImage, afterImage, beforeVideo, afterVideo, created_at
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
  */
 // Fetch lessons from the database
const fetchLessons = async (golferId: string | null = null) => {
  try {
    // Fetch logged-in PGA Professional's ID
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const loggedInPGAProID = sessionData?.session?.user?.id;
    if (!loggedInPGAProID) {
      throw new Error('Unable to fetch logged-in PGA Professional ID.');
    }

    // Query lessons for the logged-in PGA Pro
    let query = supabase
      .from('Lesson1')
      .select(`
        feedback, GolferID, PGAID, area, competency, confidence, beforeImage, afterImage, beforeVideo, afterVideo, created_at
      `)
      .eq('PGAID', loggedInPGAProID) // Filter by logged-in PGA Pro
      .order('created_at', { ascending: false });

    if (golferId) {
      query = query.eq('GolferID', golferId); // Add golfer filter if selected
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
      const { data, error } = await supabase.from('golfers1').select('GolferID, name');

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


 


  //PDF Creation
  const generatePDF = async (lesson: Lesson) => {
    const doc = new jsPDF();
  
    // Add the logo
    //doc.addImage(require('../assets/Logo.png'), 'PNG', 10, 10, 40, 20);
  
    doc.setFontSize(16);
    doc.text('Post-Lesson Report', 10, 40);
  
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(lesson.created_at).toLocaleDateString()}`, 10, 50);
    doc.text(`Golfer ID: ${lesson.GolferID}`, 10, 60);
    doc.text(`Area of Game: ${lesson.area}`, 10, 70);
    doc.text(`Competency: ${lesson.competency}`, 10, 80);
    doc.text(`Confidence: ${lesson.confidence}`, 10, 90);
    doc.text('Feedback:', 10, 100);
    doc.text(lesson.feedback, 10, 110, { maxWidth: 180 });
  
    // Skip images for now
    doc.text('Drills Assigned:', 10, 120);
    
  
    doc.save(`Lesson_Report_${lesson.GolferID}.pdf`);
  };
  const renderLesson = ({ item }: { item: Lesson }) => {
    return (
      <View style={styles.lessonCard}>
        <Text style={styles.lessonText}>Feedback: {item.feedback}</Text>
        <Text style={styles.lessonText}>Area of Game: {item.area}</Text>
        <Text style={styles.lessonText}>Competency Level: {item.competency}</Text>
        <Text style={styles.lessonText}>Confidence Level: {item.confidence}</Text>
        <Text style={styles.lessonText}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
        
        <TouchableOpacity
        style={styles.pdfButton}
        onPress={() => generatePDF(item)}
      >
        <Text style={styles.pdfButtonText}>Create PDF</Text>
      </TouchableOpacity>

        {/* Display Before Image if available */}
        {item.beforeImage && (
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaLabel}>Before Image:</Text>
            <Image source={{ uri: item.beforeImage }} style={styles.image} />
          </View>
        )}
  
        {/* Display After Image if available */}
        {item.afterImage && (
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaLabel}>After Image:</Text>
            <Image source={{ uri: item.afterImage }} style={styles.image} />
          </View>
        )}
  
        {/* Display Before Video if available */}
        {item.beforeVideo && (
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaLabel}>Before Video:</Text>
            <Video
              source={{ uri: item.beforeVideo }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          </View>
        )}
  
        {/* Display After Video if available */}
        {item.afterVideo && (
          <View style={styles.mediaContainer}>
            <Text style={styles.mediaLabel}>After Video:</Text>
            <Video
              source={{ uri: item.afterVideo }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          </View>
        )}
      </View>
      
    );
  };
  

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

//chat gpt styles
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
  mediaContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  
  mediaLabel: {
    fontSize: 14,
    color: colors.textGreen,
    marginBottom: 5,
  },
  
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
    marginBottom: 10,
  },
  
  video: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
    marginBottom: 10,
  },
  pdfButton: {
    backgroundColor: colors.textGreen,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#FFF',
    fontSize: 16,
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
