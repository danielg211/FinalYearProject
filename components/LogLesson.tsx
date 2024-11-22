import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Input, Button, Slider, CheckBox } from '@rneui/themed';
import RNPickerSelect from 'react-native-picker-select';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

// React-Native-Picker-Select reference: 
// Learn to Use React-Native-Picker-Select in 5 Minutes! https://www.youtube.com/watch?v=9MhLUaHY6M4 by Technical Rajni

// Image Picker reference:
// How to use an image picker | Universal App tutorial #4 expo, https://www.youtube.com/watch?v=iEQZU58naS8
// Expo ImagePicker documentation: https://docs.expo.dev/versions/latest/sdk/imagepicker/
// This component is based on the same CRUD Logic as PGA Dashboard

// React Native CheckBox reference:
// React Native Tutorial 57 - CheckBox | React Native Elements Programming Knowledge
// https://www.youtube.com/watch?v=R_Clppr0FaQ

// Slider reference:
// React Native Tutorial 53 - React Native Slider Example
// https://www.youtube.com/watch?v=BR2rrnTavmY&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=53
// By Programming Knowledge

// CRUD Reference
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU

// Category Selection
// Filter Product List by Category using React Native Dropdown Picker
// https://www.youtube.com/watch?v=AWB_x9Fb3vM

// Define color constants
const colors = {
  primaryGreen: '#4CAF50',
  backgroundGrayStart: '#F0F4F8',
  backgroundGrayEnd: '#CFD8DC',
  textGreen: '#2E7D32',
  borderGray: '#CCCCCC',
  buttonGray: '#E0E0E0',
};

// Interfaces for Drills and Golfers
interface Drill {
  drill_id: string;
  name: string;
  description?: string;
  category: string;
}

interface Golfer {
  GolferID: string;
  name: string;
}

// Options for dropdowns
const categoryOptions = [
  { label: 'Driving', value: 'Driving' },
  { label: 'Putting', value: 'Putting' },
  { label: 'Iron Play', value: 'Iron Play' },
  { label: 'Short Game', value: 'Short Game' },
  { label: 'Course Strategy', value: 'Course Strategy' },
  { label: 'Fitness', value: 'Fitness' },
];

const competencyOptions = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

export default function LogLesson() {
  const [feedback, setFeedback] = useState('');
  const [area, setArea] = useState('');
  const [competency, setCompetency] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [focusPoints, setFocusPoints] = useState('');
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [golferId, setGolferId] = useState('');
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [availableDrills, setAvailableDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [beforeVideo, setBeforeVideo] = useState<string | null>(null);
  const [afterVideo, setAfterVideo] = useState<string | null>(null);


  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: golfersData, error: golfersError } = await supabase.from('golfers').select('GolferID, name');
        if (golfersError) throw golfersError;

        const { data: drillsData, error: drillsError } = await supabase.from('drills').select('drill_id, name, category');
        if (drillsError) throw drillsError;

        setGolfers(golfersData || []);
        setAvailableDrills(drillsData || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch initial data.');
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Filter drills based on category
  useEffect(() => {
    setFilteredDrills(
      selectedCategory ? availableDrills.filter((drill) => drill.category === selectedCategory) : []
    );
  }, [selectedCategory, availableDrills]);

  //Video Option
  const pickVideo = async (setVideo: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Allow video selection
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setVideo(result.assets[0].uri); // Set the selected video URI
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video.');
      console.error('Error picking video:', error);
    }
  };
  

  // Select images
  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
      console.error('Error picking image:', error);
    }
  };

  // Toggle drill selection
  const toggleDrillSelection = (drillId: string) => {
    setSelectedDrills((prev) =>
      prev.includes(drillId) ? prev.filter((id) => id !== drillId) : [...prev, drillId]
    );
  };

  // Log lesson
  const logLesson = async () => {
    if (!golferId || !feedback || !area || !competency) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const { data: lessonData, error: lessonError } = await supabase.from('Lesson').insert([{
        feedback,
        area,
        competency,
        confidence,
        focusPoints,
        beforeImage,
        afterImage,
        beforeVideo, 
        afterVideo,  
        GolferID: golferId,
      }]).select();

      if (lessonError) throw lessonError;
      const lessonid = lessonData[0]?.Lessonid;

      if (selectedDrills.length > 0) {
        const drillAssignments = selectedDrills.map((drillId) => ({
          GolferID: golferId,
          drill_id: drillId,
          Lessonid: lessonid,
        }));
        const { error: drillError } = await supabase.from('AssignedDrills').insert(drillAssignments);
        if (drillError) throw drillError;
      }
      console.log('Lesson ID:', lessonid); 

      Alert.alert('Success', 'Lesson logged successfully!');
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to log lesson.');
      console.error('Error logging lesson:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFeedback('');
    setArea('');
    setCompetency('');
    setConfidence(5);
    setFocusPoints('');
    setBeforeImage(null);
    setAfterImage(null);
    setGolferId('');
    setSelectedDrills([]);
    setSelectedCategory('');
    setBeforeVideo(null);
    setAfterVideo(null);
  };

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Select Golfer:</Text>
        <RNPickerSelect
          onValueChange={(value) => setGolferId(value)}
          items={golfers.map((golfer) => ({ label: golfer.name, value: golfer.GolferID }))}
          placeholder={{ label: 'Select Golfer', value: null }}
          style={pickerSelectStyles}
        />

        <Text style={styles.label}>Feedback:</Text>
        <Input
          placeholder="Enter feedback"
          value={feedback}
          onChangeText={setFeedback}
          inputContainerStyle={styles.inputContainer}
        />

        <Text style={styles.label}>Area of Game:</Text>
        <RNPickerSelect
          onValueChange={(value) => setArea(value)}
          items={categoryOptions}
          placeholder={{ label: 'Select Area', value: null }}
          style={pickerSelectStyles}
        />

        <Text style={styles.label}>Competency Level:</Text>
        <RNPickerSelect
          onValueChange={(value) => setCompetency(value)}
          items={competencyOptions}
          placeholder={{ label: 'Select Competency', value: null }}
          style={pickerSelectStyles}
        />

        <Text style={styles.label}>Confidence Level:</Text>
        <Slider
          value={confidence}
          onValueChange={setConfidence}
          minimumValue={1}
          maximumValue={10}
          step={1}
          thumbTintColor={colors.primaryGreen}
        />
        <Text style={styles.sliderValue}>Confidence: {confidence}</Text>

        <Text style={styles.label}>Before Picture:</Text>
        <Button title="Select Before Picture" onPress={() => pickImage(setBeforeImage)} />
        {beforeImage && <Text style={styles.imageText}>Image selected</Text>}

        <Text style={styles.label}>After Picture:</Text>
        <Button title="Select After Picture" onPress={() => pickImage(setAfterImage)} />
        {afterImage && <Text style={styles.imageText}>Image selected</Text>}

        <Text style={styles.label}>Before Video:</Text>
        <Button title="Select Before Video" onPress={() => pickVideo(setBeforeVideo)} />
       

        <Text style={styles.label}>After Video:</Text>
        <Button title="Select After Video" onPress={() => pickVideo(setAfterVideo)} />
        


        <Text style={styles.label}>Drill Category:</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedCategory(value)}
          items={categoryOptions}
          placeholder={{ label: 'Select Drill Category', value: null }}
          style={pickerSelectStyles}
        />

        <Text style={styles.label}>Available Drills:</Text>
        {filteredDrills.length > 0 ? (
          filteredDrills.map((drill) => (
            <View key={drill.drill_id} style={styles.drillItem}>
              <Text>{drill.name}</Text>
              <CheckBox
                checked={selectedDrills.includes(drill.drill_id)}
                onPress={() => toggleDrillSelection(drill.drill_id)}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No drills available for the selected category.</Text>
        )}

        <Button title="Log Lesson" onPress={logLesson} buttonStyle={styles.button} />
      </ScrollView>
    </LinearGradient>
  );
}

//chatgpt for styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: {
    color: colors.textGreen,
    fontSize: 16,
    marginBottom: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  drillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    marginVertical: 20,
  },
  sliderValue: {
    color: colors.textGreen,
    textAlign: 'center',
    marginBottom: 12,
  },
  imageText: {
    color: colors.textGreen,
    textAlign: 'center',
    marginVertical: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.borderGray,
    marginVertical: 8,
  },
  videoText: {
    textAlign: 'center',
    color: 'green', 
    marginVertical: 8,
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
    backgroundColor: '#FFFFFF',
  },
};
