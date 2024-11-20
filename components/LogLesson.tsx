import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, Image } from 'react-native';
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


// Define color constants
const colors = {
  primaryGreen: '#4CAF50',
  backgroundGrayStart: '#F0F4F8',
  backgroundGrayEnd: '#CFD8DC',
  textGreen: '#2E7D32',
  borderGray: '#CCCCCC',
};

// Define interfaces for Drills and Golfers
interface Drill {
  drill_id: string;
  name: string;
  description: string;
  category: string;
}

interface Golfer {
  GolferID: string;
  name: string;
}

export default function LogLesson() {
   // State variables to manage form inputs and data
  const [feedback, setFeedback] = useState('');
  const [area, setArea] = useState('');
  const [competency, setCompetency] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [focusPoints, setFocusPoints] = useState('');
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [golferId, setGolferId] = useState('');
  const [userId, setUserId] = useState('');
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [availableDrills, setAvailableDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [selectedDrills, setSelectedDrills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Drill categories for the dropdown
  const drillCategories = [
    { label: 'Driving', value: 'Driving' },
    { label: 'Putting', value: 'Putting' },
    { label: 'Iron Play', value: 'Iron Play' },
    { label: 'Short Game', value: 'Short Game' },
    { label: 'Course Strategy', value: 'Course Strategy' },
    { label: 'Fitness', value: 'Fitness' },
  ];

  // Fetch PGA Professional, golfers, and drills
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUserId(user?.id || '');

         // Fetch golfers managed by the PGA professional
        const { data: golfersData, error: golfersError } = await supabase
          .from('golfers')
          .select('GolferID, name');
        if (golfersError) throw golfersError;
        setGolfers(golfersData || []);

        // Fetch all available drills
        const { data: drillsData, error: drillsError } = await supabase
          .from('drills')
          .select('drill_id, name, description, category');
        if (drillsError) throw drillsError;
        setAvailableDrills(drillsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch necessary data.');
      }
    };

    fetchData();
  }, []);

  // Filter drills by category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = availableDrills.filter((drill) => drill.category === selectedCategory);
      setFilteredDrills(filtered);
    } else {
      setFilteredDrills([]);
    }
  }, [selectedCategory, availableDrills]);

  // Image picker function
  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      } else {
        Alert.alert('Image selection canceled.');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  // Toggle drill selection
  const toggleDrillSelection = (drillId: string) => {
    setSelectedDrills((prev) =>
      prev.includes(drillId) ? prev.filter((id) => id !== drillId) : [...prev, drillId]
    );
  };

  // Log the lesson and assign drills
  const logLesson = async () => {
    if (!golferId || !feedback || !area || !competency) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('Lesson')
        .insert([
          {
            feedback,
            area,
            competency,
            confidence,
            focusPoints,
            beforeImage,
            afterImage,
            GolferID: golferId,
            PGAID: userId,
          },
        ])
        .select();

      if (lessonError) throw lessonError;

      const lessonId = lessonData[0].id;

      const assignedDrills = selectedDrills.map((drillId) => ({
        golfer_id: golferId,
        drill_id: drillId,
        lesson_id: lessonId,
      }));

      const { error: drillsError } = await supabase.from('AssignedDrills').insert(assignedDrills);
      if (drillsError) throw drillsError;

      Alert.alert('Success', 'Lesson and drills logged successfully!');
      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error logging lesson', error.message);
      } else {
        Alert.alert('Error logging lesson', 'An unknown error occurred.');
      }
    }
  };

  // Reset the form
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
    setFilteredDrills([]);
  };

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Select Golfer */}
        <Text style={styles.label}>Select Golfer:</Text>
        <RNPickerSelect
          onValueChange={(value) => setGolferId(value)}
          items={golfers.map((golfer) => ({
            label: golfer.name,
            value: golfer.GolferID,
          }))}
          placeholder={{ label: 'Select Golfer', value: null }}
          style={pickerSelectStyles}
        />

        {/* Feedback */}
        <Text style={styles.label}>Feedback:</Text>
        <Input
          placeholder="Enter feedback"
          value={feedback}
          onChangeText={setFeedback}
          inputContainerStyle={styles.inputContainer}
        />

        {/* Area of Game */}
        <Text style={styles.label}>Area of Game:</Text>
        <Input
          placeholder="Enter area"
          value={area}
          onChangeText={setArea}
          inputContainerStyle={styles.inputContainer}
        />

        {/* Confidence Level */}
        <Text style={styles.label}>Confidence Level:</Text>
        <Slider
          value={confidence}
          onValueChange={setConfidence}
          minimumValue={1}
          maximumValue={10}
          step={1}
          thumbTintColor={colors.primaryGreen}
          minimumTrackTintColor={colors.primaryGreen}
        />
        <Text style={styles.sliderValue}>Confidence: {confidence}</Text>

        {/* Select Drill Category */}
        <Text style={styles.label}>Drill Category:</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedCategory(value)}
          items={drillCategories}
          placeholder={{ label: 'Select a Category', value: null }}
          style={pickerSelectStyles}
        />

        {/* Assign Drills */}
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

        {/* Before Picture */}
        <Text style={styles.label}>Before Picture:</Text>
        <Button title="Select Before Picture" onPress={() => pickImage(setBeforeImage)} />
        {beforeImage && <Image source={{ uri: beforeImage }} style={styles.image} />}

        {/* After Picture */}
        <Text style={styles.label}>After Picture:</Text>
        <Button title="Select After Picture" onPress={() => pickImage(setAfterImage)} />
        {afterImage && <Image source={{ uri: afterImage }} style={styles.image} />}

        {/* Log Lesson Button */}
        <Button title="Log Lesson" onPress={logLesson} buttonStyle={styles.button} />
      </ScrollView>
    </LinearGradient>
  );
}

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
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    marginVertical: 10,
  },
  sliderValue: {
    color: colors.textGreen,
    textAlign: 'center',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.borderGray,
    marginTop: 10,
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