import React, { useState, useEffect } from 'react';
import { Alert, View, FlatList, StyleSheet, Text, ScrollView } from 'react-native';
import { Button, Input, ListItem } from '@rneui/themed';
// Import for background gradient effects
// ChatGPT recommended using LinearGradient from Expo to enhance UI design with gradient backgrounds.
// ChatGPT prompt: "How to optimize background in React Native using Expo?"
import { LinearGradient } from 'expo-linear-gradient'; 

import { supabase, supabaseAdmin } from '../lib/supabase'; // Supabase client for database interactions
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; // Type for navigation stack parameters
import { colors } from '../colors'; // Import shared colors

// References
// This component references concepts and patterns demonstrated in the Supabase CRUD tutorial on fetching, creating, modifying, and deleting data
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU 
// I had to change the fields and data types to suit my project.

// Define the type structure for a Golfer object to match the database schema
type Golfer = {
  GolferID: string;
  created_at: string;
  handicap: number;
  //progress: string; 
  name: string;
};

// Define the navigation type for navigating within the PGA Dashboard screen
type PGADashboardNavigationProp = StackNavigationProp<RootStackParamList, 'PGADashboard'>;

// Main functional component for PGA Dashboard
export default function PGADashboard() {
  const navigation = useNavigation<PGADashboardNavigationProp>(); // Navigation prop

  // Define state variables to manage golfers data and form input values
  const [golfers, setGolfers] = useState<Golfer[]>([]); // Array to store golfers data
  const [name, setName] = useState<string>(''); // Name input for adding/updating a golfer
  const [handicap, setHandicap] = useState<string>(''); // Handicap input for adding/updating a golfer
 // const [progress, setProgress] = useState<string>(''); // Progress input for adding/updating a golfer
  const [email, setEmail] = useState<string>(''); // Email input for creating a golfer account
  
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null); // Selected golfer for editing
  const [loading, setLoading] = useState<boolean>(false); // Loading indicator for async actions

  // Fetch golfers from the database when the component loads
  useEffect(() => {
    fetchGolfers();
  }, []);

  // Function to fetch all golfers from the database
  async function fetchGolfers() {
    setLoading(true); // Set loading state to true
    try {
      // Get the logged-in PGA professional's user ID
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session?.user) {
      throw new Error("Unable to retrieve authenticated PGA Professional. Please log in again.");
    }

    const PGAID = sessionData.session.user.id; // Get PGA professional's ID

    console.log(`Fetching golfers for PGA Pro: ${PGAID}`);

      const { data, error } = await supabase
        .from('golfers1')
        .select('GolferID, name, handicap, created_at')
        .eq('PGAID', PGAID)
        .order('created_at', { ascending: false }); // Order by most recent

      if (error) throw error; // Handle error if fetching fails

      setGolfers(data as Golfer[]); // Set fetched data to golfers state
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error fetching golfers', error.message); // Show error message if any
      }
    } finally {
      setLoading(false); // Set loading state to false
    }
  }

  // Function to add a new golfer to the database
  async function addGolfer() {
    if (!name.trim() || !handicap.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all fields: Name, Handicap and Email.');
      return; // Exit if any field is missing
    }
  
    setLoading(true); // Set loading state to true
  
    try {

      // Get the current logged-in PGA professional's user ID
      const { data: userSession, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !userSession?.session?.user) {
        throw new Error('Unable to retrieve authenticated PGA Professional. Please log in again.');
      }

      const PGAID = userSession.session.user.id; // Set PGAID as the logged-in user's ID

      console.log(`Creating golfer under PGAID: ${PGAID}`);

      // Create a new Supabase user with email and the default password "Golf1234"
      console.log("Creating golfer account with:", email);

      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: "Golf1234", // Default password
        email_confirm: true, // Automatically confirm email
      });
  
      if (authError) {
        console.error("Supabase Admin API Error:", authError);
        throw new Error(`Account creation failed: ${authError.message}`);
      }
      console.log("User created successfully:", userData);
   
  
      const golferID = userData.user?.id;
      if (!golferID) {
        throw new Error("User ID is undefined. Account creation failed.");
      }

       // Retrieve the user ID from the created user
      const { error: insertError } = await supabase
        .from('golfers1')
        .insert([{ GolferID: golferID, name, handicap: parseInt(handicap),email, PGAID }]);
  
      if (insertError) throw insertError; // Handle error if insertion fails
  
      // Update golfers list with the newly added golfer
      setGolfers([{ GolferID: golferID, name, handicap: parseInt(handicap), created_at: new Date().toISOString() }, ...golfers]);
  
      // Reset form inputs
      setName('');
      setHandicap('');
     // setProgress('');
      setEmail('');
  
      Alert.alert('Success', `Golfer ${name} added successfully!`); // Show success message
    } catch (error) {
      console.error("Error Adding Golfer:", error);
      if (error instanceof Error) {
        Alert.alert('Error adding golfer', error.message); // Show error message if any
      }
    } finally {
      setLoading(false); // Set loading state to false
    }
  }
  

  // Function to update an existing golfer's details
  async function updateGolfer() {
    if (!selectedGolfer || !name || !handicap ) {
      Alert.alert('Error', 'Please select a golfer and fill in all fields: Name, Handicap, and Progress.');
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      const { error } = await supabase
        .from('golfers1')
        .update({ name, handicap: parseInt(handicap) })
        .eq('GolferID', selectedGolfer.GolferID); // Match GolferID to update the correct golfer

      if (error) throw error; // Handle error if update fails

      // Update golfers list to reflect changes
      setGolfers((prevGolfers) =>
        prevGolfers.map((g) =>
          g.GolferID === selectedGolfer.GolferID ? { ...g, name, handicap: parseInt(handicap)} : g
        )
      );

      // Reset selected golfer and form inputs
      setSelectedGolfer(null);
      setName('');
      setHandicap('');
     // setProgress('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error updating golfer', error.message); // Show error message if any
      }
    } finally {
      setLoading(false); // Set loading state to false
    }
  }

  // Function to delete a golfer from the database
  async function deleteGolfer(golferID: string) {
    try {
      const { error } = await supabase
        .from('golfers1')
        .delete()
        .eq('GolferID', golferID); // Match GolferID to delete the correct golfer

      if (error) throw error; // Handle error if deletion fails

      // Update golfers list by removing the deleted golfer
      setGolfers(golfers.filter((g) => g.GolferID !== golferID));
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error deleting golfer', error.message); // Show error message if any
      }
    }
  }

  // Function to select a golfer for editing
  function selectGolfer(golfer: Golfer) {
    setSelectedGolfer(golfer); // Set the selected golfer
    setName(golfer.name); // Set name input to golfer's name
    setHandicap(golfer.handicap.toString()); // Set handicap input
   // setProgress(golfer.progress); // Set progress input
  }

  // Function to render each golfer item in the list
  const renderGolfer = ({ item }: { item: Golfer }) => (
    <ListItem bottomDivider onPress={() => selectGolfer(item)} containerStyle={styles.listItem}>
      <ListItem.Content>
        <ListItem.Title>{`Name: ${item.name}`}</ListItem.Title>
        <ListItem.Subtitle>{`Handicap: ${item.handicap}`}</ListItem.Subtitle>
       {/* <ListItem.Subtitle>{`Progress: ${item.progress}`}</ListItem.Subtitle> */}
        <ListItem.Subtitle>{`Created At: ${new Date(item.created_at).toLocaleDateString()}`}</ListItem.Subtitle>
      </ListItem.Content>
      <Button title="Delete" buttonStyle={styles.deleteButton} onPress={() => deleteGolfer(item.GolferID)} />
    </ListItem>
  );

  const handleHandicapChange = (value: string) => {
    // Remove non-numeric characters (except '-')
    let sanitizedValue = value.replace(/[^0-9-]/g, '');
  
    // Convert to a number
    const numericValue = parseFloat(sanitizedValue);
  
    // Check if the number is within the valid range
    if (isNaN(numericValue) || numericValue < -5 || numericValue > 54) {
      Alert.alert("Invalid Handicap", "Handicap must be between -5 and 54.");
      return;
    }
  
    setHandicap(sanitizedValue);
  };
  

  return (
    // Linear gradient background
    
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>Golfer Management</Text>

        {/* Input fields for golfer details */}
        <Input label="Name" value={name} onChangeText={setName} placeholder="Enter Name" containerStyle={styles.inputContainer} />
        <Input label="Handicap" value={handicap} keyboardType="numeric" onChangeText={handleHandicapChange} placeholder="Enter Handicap" containerStyle={styles.inputContainer} />
       {/* <Input label="Progress" value={progress} onChangeText={setProgress} placeholder="Enter Progress" containerStyle={styles.inputContainer} /> */}
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter Golfer's Email" containerStyle={styles.inputContainer} />
       

        {/* Button to add or update golfer */}
        <Button
          title={selectedGolfer ? 'Update Golfer' : 'Add Golfer'}
          onPress={() => (selectedGolfer ? updateGolfer() : addGolfer())}
          loading={loading}
          buttonStyle={styles.primaryButton}
        />

        {/* Button to navigate to log a lesson 
        <Button title="Log a Lesson" onPress={() => navigation.navigate('LogLesson')} buttonStyle={styles.secondaryButton} />
        */}
        
        {/* FlatList to display golfers */}
        <FlatList
          data={golfers}
          keyExtractor={(item) => item.GolferID}
          renderItem={renderGolfer}
          scrollEnabled={false} // Disable FlatList scrolling to allow ScrollView to handle it
        />
      </ScrollView>
    
  );
}

// Styles for layout and design elements
//https://reactnative.dev/docs/style
// ChatGPT was used to optimize styling choices for buttons, list items, and input containers for visual consistency and improved UI aesthetics.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",  // ✅ Keeps the background white (like PGA Home)
  },

  // 📌 Header Section
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E88E5",  // ✅ Same as PGA Home title
    marginBottom: 10,
  },

  // 📌 Input Fields (New Background Color)
  inputContainer: {
    borderRadius: 10, 
    borderWidth: 1,
    borderColor: "#BDBDBD",  // ✅ Softer gray border for subtle contrast
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#F0F4F8",  // ✅ Light gray background for contrast
    width: "90%",  
    alignSelf: "center",
    marginBottom: 15, // ✅ Consistent spacing
  },

  //  Primary Button (Same as PGA Home)
  primaryButton: {
    backgroundColor: "#4CAF50",  // ✅ PGA Green
    borderRadius: 10,
    paddingVertical: 14,
    width: "90%",
    alignSelf: "center",
    marginVertical: 8,
  },

  //  Secondary Button (Gray Buttons)
  secondaryButton: {
    backgroundColor: "#E0E0E0",  // ✅ Light gray secondary button
    borderRadius: 10,
    paddingVertical: 14,
    width: "90%",
    alignSelf: "center",
    marginVertical: 8,
  },

  //  Delete Button
  deleteButton: {
    backgroundColor: "#D32F2F",  // ✅ Red for delete
    borderRadius: 10,
    paddingVertical: 10,
    width: "90%",
    alignSelf: "center",
    marginVertical: 8,
  },

  // 📌 Golfer List Items (Updated Card Color)
  listItem: {
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    backgroundColor: "#F8F9FA",  // ✅ Light gray to contrast white background
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,  // ✅ Subtle shadow for depth
    borderWidth: 1,
    borderColor: "#E0E0E0",  // ✅ Soft border to match modern UI
  },
});


