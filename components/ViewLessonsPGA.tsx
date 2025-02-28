import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';
import { Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import jsPDF from 'jspdf';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';

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

// "Generating PDF Files with jsPDF Library in JavaScript: Quick Start Guide" by Code with Yousef, available on YouTube.
// YouTube Video: https://www.youtube.com/watch?v=i7EOZB3a1Vs

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetchGolfers();
    fetchLessons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedGolfer, selectedDate]);



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
      query = query.eq('GolferID', golferId); 
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
    try {
      // Fetch golfer and PGA names
      const { data: golferData, error: golferError } = await supabase
        .from('golfers1')
        .select('name')
        .eq('GolferID', lesson.GolferID)
        .single();
  
      if (golferError) throw new Error('Failed to fetch golfer name.');
  
      const { data: pgaData, error: pgaError } = await supabase
        .from('PGAProfessional')
        .select('name')
        .eq('PGAID', lesson.PGAID)
        .single();
  
      if (pgaError) throw new Error('Failed to fetch PGA professional name.');
  
      const golferName = golferData?.name || 'Unknown Golfer';
      const pgaName = pgaData?.name || 'Unknown PGA Professional';
  
      const doc = new jsPDF();
  
      // Header Section
      doc.setFillColor(76, 175, 80); // Green Background
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26); // Larger Title
      doc.setFont('helvetica', 'bold');
      doc.text('Golf IQ Pro - Post-Lesson Report', 105, 20, { align: 'center' });
  
      // Add some vertical spacing
      let yPos = 50;
  
      // Date
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Date:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${new Date(lesson.created_at).toLocaleDateString()}`, 60, yPos);
      yPos += 20;
  
      // Golfer & PGA Professional
      doc.setFont('helvetica', 'bold');
      doc.text(`Golfer Name:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(golferName, 70, yPos);
      yPos += 20;
  
      doc.setFont('helvetica', 'bold');
      doc.text(`PGA Professional:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(pgaName, 85, yPos);
      yPos += 30;
  
      // Section Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 20;
  
      // Lesson Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Lesson Details', 20, yPos);
      yPos += 15;
  
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Area of Game:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(lesson.area, 80, yPos);
      yPos += 20;
  
      doc.setFont('helvetica', 'bold');
      doc.text(`Competency:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(lesson.competency, 80, yPos);
      yPos += 20;
  
      doc.setFont('helvetica', 'bold');
      doc.text(`Confidence Level:`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${lesson.confidence}`, 110, yPos);
      yPos += 30;
  
      // Feedback
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Feedback:', 20, yPos);
      yPos += 15;
  
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.text(lesson.feedback, 20, yPos, { maxWidth: 170, align: 'left' });
  
      yPos += 50;
  
      // Footer
      doc.setFontSize(14);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by Golf IQ Pro', 20, 280);
  
      // Save PDF
      doc.save(`Lesson_Report_${lesson.GolferID}.pdf`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred while generating the PDF.');
    }
  };
  
   const applyFilters = () => {
    let filtered = [...lessons];

    if (selectedGolfer) {
      filtered = filtered.filter((lesson) => lesson.GolferID === selectedGolfer);
    }

    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      filtered = filtered.filter((lesson) => lesson.created_at.startsWith(selectedDateString));
    }

    setFilteredLessons(filtered);
  };

  const filterByDateRange = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    const filtered = lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.created_at);
      return lessonDate >= pastDate;
    });

    setFilteredLessons(filtered);
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
       {/* Date Picker */}
       <Text style={styles.label}>Filter by Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.dateText}>{selectedDate ? selectedDate.toDateString() : 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Quick Filters */}
      <View style={styles.buttonContainer}>
        <Button title="Last 7 Days" onPress={() => filterByDateRange(7)} buttonStyle={styles.filterButton} />
        <Button title="Last Month" onPress={() => filterByDateRange(30)} buttonStyle={styles.filterButton} />
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
        data={filteredLessons}
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
  
  
  
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32', // PGA Dark Green
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF', // White background for dropdown
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD', // Light Gray Border
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pickerSelect: {
    fontSize: 16,
    color: '#2E7D32', // PGA Dark Green
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD', // Light Gray Border
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#2E7D32', // PGA Dark Green
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#1976D2', // PGA Blue
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
  },
  applyButton: {
    backgroundColor: '#2E7D32', // PGA Dark Green
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF', // White background for cards
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderColor: '#BDBDBD', // Light gray border
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonText: {
    fontSize: 16,
    color: '#333', // Dark gray for readability
    marginBottom: 8,
  },
  lessonTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32', // PGA Dark Green
  },
  pdfButton: {
    backgroundColor: '#2E7D32', // PGA Dark Green
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#FFFFFF', // White text for visibility
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#757575', // Medium gray
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
