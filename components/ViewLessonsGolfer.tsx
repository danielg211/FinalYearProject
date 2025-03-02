import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Button } from 'react-native';
//import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import jsPDF from 'jspdf';
// FlatList reference:
// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge
// CRUD Reference

// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU
// Uses Read logic from PGA Dashboard

// SupaBase Docs on Javascript https://supabase.com/docs/reference/javascript/select

// React Native Docs Display Image https://reactnative.dev/docs/image

// "Generating PDF Files with jsPDF Library in JavaScript: Quick Start Guide" by Code with Yousef, 
// YouTube Video: https://www.youtube.com/watch?v=i7EOZB3a1Vs

type Lesson = {
  Lessonid: string;
  created_at: string;
  feedback: string;
  drills: string[];
  area: string;
};

export default function ViewLessonsGolfer() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [selectedDate]);

  

  // Apply Filters (Date Selection)
  const applyFilters = () => {
    let filtered = [...lessons];

    if (selectedDate) {
      const selectedDateString = selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      filtered = filtered.filter((lesson) => lesson.created_at.startsWith(selectedDateString));
    }

    setFilteredLessons(filtered);
  };

  // Quick Filter (Last 7 Days / Last Month)
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

  useEffect(() => {
    applyFilters();
  }, [selectedDate]);
  
  // ✅ Define `fetchLessons` outside the useEffect so it is accessible globally
  const fetchLessons = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError) throw sessionError;
  
      const golferId = session?.user.id;
  
      if (!golferId) {
        throw new Error('User not authenticated');
      }
  
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('Lesson1')
        .select('Lessonid, created_at, feedback, area, drills:AssignedDrills(drill_id)')
        .eq('GolferID', golferId)
        .order('created_at', { ascending: false });
  
      if (lessonsError) throw lessonsError;
  
      const mappedLessons = await Promise.all(
        lessonsData.map(async (lesson: any) => {
          const drillIds = lesson.drills.map((d: any) => d.drill_id);
  
          const { data: drillNames, error: drillError } = await supabase
            .from('drills')
            .select('name')
            .in('drill_id', drillIds);
  
          if (drillError) throw drillError;
  
          return {
            ...lesson,
            drills: drillNames.map((d: any) => d.name),
          };
        })
      );
  
      setLessons(mappedLessons as Lesson[]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ Call `fetchLessons` inside `useEffect`
  useEffect(() => {
    fetchLessons();
  }, []);
  
  // PDF Generation
  const generatePDF = (lesson: Lesson) => {
    const doc = new jsPDF();
  
    // Header Section
    doc.setFillColor(76, 175, 80); // Green Background
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26); // Larger Title
    doc.setFont('helvetica', 'bold');
    doc.text('Golf IQ Pro - Lesson Report', 105, 20, { align: 'center' });
  
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
  
    // Lesson Area
    doc.setFont('helvetica', 'bold');
    doc.text(`Area of Game:`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(lesson.area, 80, yPos);
    yPos += 30;
  
    // Section Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 20;
  
    // Drills Assigned
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Assigned Drills:', 20, yPos);
    yPos += 15;
  
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    const drillText = lesson.drills.length > 0 ? lesson.drills.join(', ') : 'None';
    doc.text(drillText, 20, yPos, { maxWidth: 170, align: 'left' });
    yPos += 30;
  
    // Feedback
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Coach Feedback:', 20, yPos);
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
    doc.save(`Lesson_${lesson.Lessonid}.pdf`);
  };
  

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.area}>Area: {item.area}</Text>
      <Text style={styles.date}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
      <Text style={styles.feedback}>Feedback: {item.feedback}</Text>
      <Text style={styles.drills}>
        Drills: {item.drills.length > 0 ? item.drills.join(', ') : 'None'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => generatePDF(item)}
      >
        <Text style={styles.buttonText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#F2F2F2', '#E6E6E6']} style={styles.container}>
      <Text style={styles.header}>View Lessons</Text>

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
            {/* Filter Buttons for Last 7 Days & Last Month */}
            <View style={styles.buttonContainer}>
  <Button title="Last 7 Days" color="#1976D2" onPress={() => filterByDateRange(7)} />
  <Button title="Last Month" color="#1976D2" onPress={() => filterByDateRange(30)} />
</View>


      

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={filteredLessons}
          keyExtractor={(item) => item.Lessonid}
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
    lessonCard: {
      backgroundColor: '#FFFFFF',  // White background
      borderRadius: 12,  // Rounded corners
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderColor: '#DDD',  // Light gray border
      borderWidth: 1,
    },
  area: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  feedback: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  drills: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4CAF50', // Green color for primary buttons
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
      borderRadius: 12,  // More rounded
      borderWidth: 1,
      borderColor: '#BDBDBD',  // Light Gray Border
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      shadowColor: '#000',  // Soft shadow
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2, // Small elevation for depth
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
      borderRadius: 25, // Rounded button
      paddingVertical: 12,
      marginHorizontal: 8, // Space between buttons
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    filterButtonText: {
      color: '#FFFFFF', // White text for visibility
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    
    applyButton: {
      backgroundColor: '#2E7D32', // PGA Dark Green
      borderRadius: 8,
      paddingVertical: 12,
      marginBottom: 15,
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
