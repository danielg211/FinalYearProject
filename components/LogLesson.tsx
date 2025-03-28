import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Input, Button, Slider, CheckBox } from '@rneui/themed';
import RNPickerSelect from 'react-native-picker-select';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { LogBox } from 'react-native';
import { Picker } from '@react-native-picker/picker';


// Suppress VirtualizedLists inside ScrollView warning
LogBox.ignoreLogs(["Slider: Support for defaultProps will be removed"]);


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
  const [pgaId, setPgaId] = useState('');
  const [beforeVideoSuccess, setBeforeVideoSuccess] = useState(false);
  const [afterVideoSuccess, setAfterVideoSuccess] = useState(false);




  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

       

      // ✅ Ensure user exists before proceeding
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }

        const { data: golfersData, error: golfersError } = await supabase
        .from('golfers1')
        .select('GolferID, name')
        .eq('PGAID', user.id);
        

        if (golfersError) throw golfersError;

         // Check if user is null
        if (!user) {
          throw new Error("User not found. Please log in again.");
        }

        const { data: pgaData, error: pgaError } = await supabase
        .from('PGAProfessional')
        .select('PGAID')
        .eq('PGAID', user.id)
        .single();

      if (pgaError) throw pgaError;

      setPgaId(pgaData.PGAID); // Set the PGAID

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

  //Video 
  /*
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
  */
 // ✅ Pick a video and display a success message
const pickVideo = async (setVideo: React.Dispatch<React.SetStateAction<string | null>>, setSuccess: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos, 
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setVideo(result.assets[0].uri);
      setSuccess(true); // ✅ Show success message
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
    if (!golferId || !feedback || !area || !competency || !pgaId) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const { data: lessonData, error: lessonError } = await supabase.from('Lesson1').insert([{
        feedback,
        area,
        competency,
        confidence,
       // focusPoints,
        beforeImage,
        afterImage,
        beforeVideo, 
        afterVideo,  
        GolferID: golferId,
        PGAID: pgaId, 
      }]).select();

      if (lessonError) throw lessonError;
      const lessonid = lessonData[0]?.Lessonid;

      if (selectedDrills.length > 0) {
        const drillAssignments = selectedDrills.map((drillId) => ({
          GolferID: golferId,
          drill_id: drillId,
          Lessonid: lessonid,
          PGAID: pgaId,
        }));
        const { error: drillError } = await supabase.from('AssignedDrills').insert(drillAssignments);
        if (drillError) throw drillError;
      }

      if (!pgaId) {
        Alert.alert('Error', 'PGA Professional ID not found. Please try again.');
        return;
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
    //setFocusPoints('');
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
        <View style={styles.pickerContainer}>
        <Picker
          selectedValue={golferId}
          onValueChange={(value) => setGolferId(value)}
          mode="dropdown"
          style={styles.picker}
        >
          <Picker.Item label="Select Golfer" value="" />
          {golfers.map((golfer) => (
            <Picker.Item key={golfer.GolferID} label={golfer.name} value={golfer.GolferID} />
          ))}
        </Picker>
      </View>


        <Text style={styles.label}>Lesson Notes:</Text>
        <Input
          placeholder="Write lesson notes here..."
          value={feedback}
          onChangeText={setFeedback}
          inputContainerStyle={styles.inputContainer}
          multiline={true}  // Enable multi-line text
          numberOfLines={4}  // Adjust height for better readability
          textAlignVertical="top"  // Ensure text starts at the top
        />

        <Text style={styles.label}>Area of Game:</Text>
        <View style={styles.pickerContainer}>
        <Picker
          selectedValue={area}
          onValueChange={(value) => setArea(value)}
          mode="dropdown"
          style={styles.picker}
        >
          <Picker.Item label="Select Area" value="" />
          {categoryOptions.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>


        <Text style={styles.label}>Competency Level:</Text>
        <View style={styles.pickerContainer}>
        <Picker
          selectedValue={competency}
          onValueChange={(value) => setCompetency(value)}
          mode="dropdown"
          style={styles.picker}
        >
          <Picker.Item label="Select Competency" value="" />
          {competencyOptions.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>


        <View style={styles.sliderContainer}>
          <Text style={styles.sliderText}>Confidence Level: {confidence}</Text>
          <Slider
            value={confidence}
            onValueChange={setConfidence}
            minimumValue={1}
            maximumValue={10}
            step={1}
            thumbTintColor={colors.primaryGreen}
          />
        </View>

        
        <Text style={styles.sliderValue}>Confidence: {confidence}</Text>
        {/*
        <Text style={styles.label}>Before Picture:</Text>
        <Button title="Select Before Picture" onPress={() => pickImage(setBeforeImage)} buttonStyle={styles.buttonSecondary} />
        {beforeImage && <Text style={styles.imageText}>Image selected</Text>}

        <Text style={styles.label}>After Picture:</Text>
        <Button title="Select After Picture" onPress={() => pickImage(setAfterImage)} buttonStyle={styles.buttonSecondary}/>
        {afterImage && <Text style={styles.imageText}>Image selected</Text>}
          */}
        <Text style={styles.label}>Before Video:</Text>

        <Button 
          title="Select Before Video" 
          onPress={() => pickVideo(setBeforeVideo, setBeforeVideoSuccess)} 
          buttonStyle={styles.buttonSecondary} 
        />
        {beforeVideoSuccess && <Text style={styles.successMessage}>Before video selected successfully!</Text>}

        <Text style={styles.label}>After Video:</Text>
        <Button 
          title="Select After Video" 
          onPress={() => pickVideo(setAfterVideo, setAfterVideoSuccess)} 
          buttonStyle={styles.buttonSecondary} 
        />
        {afterVideoSuccess && <Text style={styles.successMessage}>After video selected successfully!</Text>}



        <Text style={styles.label}>Drill Category:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            mode="dropdown"
            style={styles.picker}
          >
            <Picker.Item label="Select Drill Category" value="" />
            {categoryOptions.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>


        <Text style={styles.label}>Available Drills:</Text>
        {filteredDrills.length > 0 ? (
          filteredDrills.map((drill) => (
            <View key={drill.drill_id} style={styles.drillItem}>
              <Text style={styles.drillText}>{drill.name}</Text>
              <CheckBox
                checked={selectedDrills.includes(drill.drill_id)}
                onPress={() => toggleDrillSelection(drill.drill_id)}
                containerStyle={styles.checkBox}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No drills available for the selected category.</Text>
        )}

        <Button title="Log Lesson" onPress={logLesson} buttonStyle={styles.buttonPrimary} />
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

  // 📌 Bold Labels for Better Visibility
  label: {
    color: "#2E7D32",  // ✅ PGA Green
    fontSize: 16,
    fontWeight: "bold",  // ✅ Bold text for better readability
    marginBottom: 4,
  },
  successMessage: {
    color: "green",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  
  // 📌 Input Fields (Refined)
  inputContainer: {
    backgroundColor: "#F0F4F8",  // ✅ Light Gray for Contrast
    borderRadius: 8,
    borderColor: "#BDBDBD",  // ✅ Subtle gray border
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    paddingVertical: 10,  // ✅ Better spacing
    width: "100%", 
    minHeight: 100,  // ✅ Taller height for multi-line text
    justifyContent: "flex-start",
  },

  // 📌 Drill Items (CheckBox Styling)
  drillItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: "#BDBDBD",
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: "#F8F9FA", 
  },
  drillText: {
    flex: 1, 
    fontSize: 16, 
    color: "#333", 
    fontWeight: "bold",  // ✅ Bold drill names
  },

  // 📌 Buttons (Primary & Secondary)
  buttonPrimary: {
    backgroundColor: "#4CAF50",  // ✅ PGA Green
    borderRadius: 8,
    marginVertical: 15,  // ✅ More spacing
    paddingVertical: 12,
  },
  buttonSecondary: {
    backgroundColor: "#1976D2", // ✅ Blue for secondary buttons (image/video upload)
    borderRadius: 8,
    marginVertical: 10,
    paddingVertical: 10,
  },

  // 📌 Slider Styling
  sliderContainer: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    marginVertical: 15,
    backgroundColor: "#FAFAFA",
  },
  sliderText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",  // ✅ Bold Confidence Level Text
    color: "#2E7D32",
  },
  checkBox: {
    padding: 5,
  },

  // 📌 Other Text Improvements
  sliderValue: {
    color: "#2E7D32",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",  // ✅ Bold Confidence Value
  },
  imageText: {
    color: "#2E7D32",
    textAlign: "center",
    marginVertical: 8,
    fontWeight: "bold",  // ✅ Bold Image Status
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 14,
    color: "#757575",  // ✅ Darker Gray for Readability
    marginVertical: 8,
    fontWeight: "bold",
  },
  videoText: {
    textAlign: "center",
    color: "green", 
    marginVertical: 8,
    fontWeight: "bold",  // ✅ Bold Video Status
  },
  pickerContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  
  picker: {
    
    width: '100%',
    color: '#2E7D32',
  },
  
  // 📌 Picker (Dropdown) Styling
  
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
