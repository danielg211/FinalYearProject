import React, { useState, useEffect } from 'react';
import { Alert, View, FlatList, StyleSheet, Text } from 'react-native';
import { Button, Input, ListItem } from '@rneui/themed';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; 

//References
// This component references concepts and patterns demonstrated in the Supabase CRUD tutorial on fetching, creating, modifying, and deleting data
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube, https://www.youtube.com/watch?v=4yVSwHO5QHU


// Define the Golfer type to match the structure of a golfer record in the database
type Golfer = {
  GolferID: string; // Unique identifier for the golfer
  created_at: string; // Date when the golfer was added
  handicap: number; // Golfer's handicap
  progress: string; // Progress notes for the golfer
  name: string; // Golfer's name
};

// Define the navigation type to navigate between screens in the app
type PGADashboardNavigationProp = StackNavigationProp<RootStackParamList, 'PGADashboard'>; 

// The main component for managing golfers
export default function PGADashboard() {
  const navigation = useNavigation<PGADashboardNavigationProp>();

  // State variables to store golfer data and input values
  const [golfers, setGolfers] = useState<Golfer[]>([]); // List of golfers
  const [name, setName] = useState<string>(''); // Input for golfer's name
  const [handicap, setHandicap] = useState<string>(''); // Input for golfer's handicap
  const [progress, setProgress] = useState<string>(''); // Input for golfer's progress
  const [email, setEmail] = useState<string>(''); // Input for golfer's email (account creation)
  const [password, setPassword] = useState<string>(''); // Input for golfer's password (account creation)
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null); // Selected golfer for editing
  const [loading, setLoading] = useState<boolean>(false); // Loading state to show when a process is happening

  // Load the golfers when the component first appears on the screen
  useEffect(() => {
    fetchGolfers();
  }, []);

  // Fetch all golfers from the database
  async function fetchGolfers() {
    setLoading(true); // Show loading indicator
    try {
      const { data, error } = await supabase
        .from('golfers')
        .select('GolferID, name, handicap, progress, created_at')
        .order('created_at', { ascending: false }); // Get golfers ordered by most recent

      if (error) throw error; // If there's an error, stop and handle it

      setGolfers(data as Golfer[]); // Set the retrieved golfers to the golfers state
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error fetching golfers', error.message); // Show an alert if an error occurs
        console.error('Error fetching golfers:', error.message); // Log the error
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }

  // Function to add a new golfer to the database
  async function addGolfer() {
    // Check if all required fields are filled
    if (!name || !handicap || !progress || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields: Name, Handicap, Progress, Email, and Password.');
      return; // Stop the function if any field is missing
    }

    setLoading(true); // Show loading indicator

    try {
      // Step 1: Create a new user in Supabase's authentication system
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Automatically confirm the email
      });

      if (authError) throw authError; // Handle error if user creation fails

      // Step 2: Add the golfer's information to the 'golfers' table
      const golferID = userData.user?.id; // Get the unique ID for the new user
      const { error: insertError } = await supabase
        .from('golfers')
        .insert([{ GolferID: golferID, name, handicap: parseInt(handicap), progress }]); // Insert new golfer record

      if (insertError) throw insertError; // Handle error if insertion fails

      // Update the local state to include the new golfer in the list
      setGolfers([{ GolferID: golferID, name, handicap: parseInt(handicap), progress, created_at: new Date().toISOString() }, ...golfers]);
      
      // Clear the input fields after adding the golfer
      setName('');
      setHandicap('');
      setProgress('');
      setEmail('');
      setPassword('');

      Alert.alert('Success', 'Golfer account created successfully'); // Show success message
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error adding golfer', error.message); // Show error message if addition fails
        console.error('Error adding golfer:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }

  // Function to update an existing golfer's information
  async function updateGolfer() {
    // Check if a golfer is selected and all fields are filled
    if (!selectedGolfer || !name || !handicap || !progress) {
      Alert.alert('Error', 'Please select a golfer and fill in all fields: Name, Handicap, and Progress.');
      return;
    }

    setLoading(true); // Show loading indicator

    try {
      // Update golfer's data in the database
      const { error } = await supabase
        .from('golfers')
        .update({ name, handicap: parseInt(handicap), progress })
        .eq('GolferID', selectedGolfer.GolferID); // Match the golfer ID to update the correct golfer

      if (error) throw error; // Handle error if update fails

      // Update the golfer data locally in the state
      setGolfers((prevGolfers) =>
        prevGolfers.map((g) =>
          g.GolferID === selectedGolfer.GolferID ? { ...g, name, handicap: parseInt(handicap), progress } : g
        )
      );

      // Clear the selected golfer and input fields after updating
      setSelectedGolfer(null);
      setName('');
      setHandicap('');
      setProgress('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error updating golfer', error.message); // Show error message if update fails
        console.error('Error updating golfer:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }

  // Function to delete a golfer from the database
  async function deleteGolfer(golferID: string) {
    try {
      const { error } = await supabase
        .from('golfers')
        .delete()
        .eq('GolferID', golferID); // Match the golfer ID to delete the correct golfer

      if (error) throw error; // Handle error if deletion fails

      // Remove the deleted golfer from the local state
      setGolfers(golfers.filter((g) => g.GolferID !== golferID));
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error deleting golfer', error.message); // Show error message if deletion fails
        console.error('Error deleting golfer:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  // Function to select a golfer from the list for editing
  function selectGolfer(golfer: Golfer) {
    setSelectedGolfer(golfer); // Set the selected golfer
    setName(golfer.name); // Set the name input to the selected golfer's name
    setHandicap(golfer.handicap.toString()); // Set handicap input
    setProgress(golfer.progress); // Set progress input
  }

  // Function to render each golfer in the list
  const renderGolfer = ({ item }: { item: Golfer }) => (
    <ListItem bottomDivider onPress={() => selectGolfer(item)}>
      <ListItem.Content>
        <ListItem.Title>{`Name: ${item.name}`}</ListItem.Title>
        <ListItem.Subtitle>{`Handicap: ${item.handicap}`}</ListItem.Subtitle>
        <ListItem.Subtitle>{`Progress: ${item.progress}`}</ListItem.Subtitle>
        <ListItem.Subtitle>{`Created At: ${new Date(item.created_at).toLocaleDateString()}`}</ListItem.Subtitle>
      </ListItem.Content>
      <Button title="Delete" onPress={() => deleteGolfer(item.GolferID)} />
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PGA Dashboard - Golfer Management</Text>
      
      {/* Input fields for golfer details */}
      <Input label="Name" value={name} onChangeText={setName} placeholder="Enter Name" />
      <Input label="Handicap" value={handicap} keyboardType="numeric" onChangeText={setHandicap} placeholder="Enter Handicap" />
      <Input label="Progress" value={progress} onChangeText={setProgress} placeholder="Enter Progress" />
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter Golfer's Email" />
      <Input label="Password" value={password} secureTextEntry onChangeText={setPassword} placeholder="Enter Golfer's Password" />

      {/* Button to add or update golfer */}
      <Button title={selectedGolfer ? 'Update Golfer' : 'Add Golfer'} onPress={addGolfer} loading={loading} containerStyle={styles.button} />

      {/* Button to navigate to the lesson logging screen */}
      <Button title="Log a Lesson" onPress={() => navigation.navigate('LogLesson')} />

      {/* List of golfers */}
      <FlatList data={golfers} keyExtractor={(item) => item.GolferID} renderItem={renderGolfer} />
    </View>
  );
}

// Styles for layout and spacing
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
});
