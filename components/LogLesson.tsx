import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Picker component for dropdown selection
import { supabase } from '../lib/supabase'; // Import supabase for database interaction

// Define the structure of a Golfer object with two properties: GolferID and name
interface Golfer {
  GolferID: string; // Unique identifier for each golfer
  name: string; // Name of the golfer
}

// The LogLesson component allows PGA professionals to log lesson details for golfers
export default function LogLesson() {
  // Define state variables to hold form data and golfer information
  const [feedback, setFeedback] = useState(''); // Text input for lesson feedback
  const [drillsAssigned, setDrillsAssigned] = useState(''); // Text input for assigned drills
  const [golferId, setGolferId] = useState(''); // Selected golfer's ID from the dropdown
  const [userId, setUserId] = useState(''); // PGA professional's ID (retrieved from user session)
  const [golfers, setGolfers] = useState<Golfer[]>([]); // List of golfers to display in the dropdown

  // This useEffect hook runs once when the component loads
  useEffect(() => {
    // Function to fetch the logged-in user's ID (PGA professional)
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message); // Log error if there's an issue
      } else if (user) {
        setUserId(user.id); // Store the user's ID in the state variable
      }
    };
    fetchUser(); // Call the fetchUser function to get the user's ID

    // Function to fetch the list of golfers from the database
    const fetchGolfers = async () => {
      const { data, error } = await supabase.from('golfers').select('GolferID, name');
      if (error) {
        console.error('Error fetching golfers:', error.message); // Log error if there's an issue
      } else {
        setGolfers(data as Golfer[]); // Store the list of golfers in the state variable
      }
    };
    fetchGolfers(); // Call the fetchGolfers function to get the list of golfers
  }, []);

  // Function to log a lesson with the provided feedback, drills, golfer, and user information
  async function logLesson() {
    console.log('Feedback:', feedback); // Log feedback to the console
    console.log('Drills Assigned:', drillsAssigned); // Log assigned drills to the console
    console.log('Golfer ID:', golferId); // Log selected golfer's ID
    console.log('PGA ID (User ID):', userId); // Log PGA professional's ID

    try {
      // Insert a new lesson record into the Lesson table in the database
      const { data, error } = await supabase.from('Lesson').insert([
        {
          feedback: feedback, // Feedback text from the input
          drillsAssigned: drillsAssigned, // Assigned drills text from the input
          GolferID: golferId, // Selected golfer's ID
          PGAID: userId, // PGA professional's ID
        }
      ]);

      if (error) {
        console.error('Error logging lesson:', error.message); // Log error if there's an issue
        throw error; // Throw the error to handle it in the catch block
      }
      console.log('Insert result:', data); // Log the result of the insert operation
      Alert.alert('Lesson logged successfully!'); // Show success message to the user
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error logging lesson:', error.message); // Show error message if there's an issue
      } else {
        Alert.alert('An unknown error occurred.'); // Handle any other unexpected errors
      }
    }
  }

  // The component's user interface
  return (
    <View style={{ padding: 20 }}>
      {/* Text input for lesson feedback */}
      <Text>Feedback:</Text>
      <TextInput
        placeholder="Enter feedback" // Placeholder text shown in the input
        value={feedback} // Current value of the feedback input
        onChangeText={setFeedback} // Update feedback when the user types
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }} // Styling for the input box
      />

      {/* Text input for drills assigned */}
      <Text>Drills Assigned:</Text>
      <TextInput
        placeholder="Drills assigned" // Placeholder text shown in the input
        value={drillsAssigned} // Current value of the drills assigned input
        onChangeText={setDrillsAssigned} // Update drills assigned when the user types
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }} // Styling for the input box
      />

      {/* Dropdown (Picker) to select a golfer from the list */}
      <Text>Select Golfer:</Text>
      <Picker
        selectedValue={golferId} // The current selection in the dropdown
        onValueChange={(itemValue, itemIndex) => setGolferId(itemValue)} // Update golferId when a new item is selected
        style={{ borderWidth: 1, marginVertical: 10 }} // Styling for the dropdown
      >
        <Picker.Item label="Select Golfer" value="" /> {/* Default option */}
        {golfers.map((golfer) => (
          <Picker.Item key={golfer.GolferID} label={golfer.name} value={golfer.GolferID} />
          // Each golfer in the list is displayed as an option in the dropdown
        ))}
      </Picker>

      {/* Button to submit (log) the lesson */}
      <Button title="Log Lesson" onPress={logLesson} />
    </View>
  );
}
