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
  progress: string; 
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
  const [progress, setProgress] = useState<string>(''); // Progress input for adding/updating a golfer
  const [email, setEmail] = useState<string>(''); // Email input for creating a golfer account
  const [password, setPassword] = useState<string>(''); // Password input for creating a golfer account
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
      const { data, error } = await supabase
        .from('golfers')
        .select('GolferID, name, handicap, progress, created_at')
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
    if (!name || !handicap || !progress || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields: Name, Handicap, Progress, Email, and Password.');
      return; // Exit if any field is missing
    }

    setLoading(true); // Set loading state to true

    try {
      // Create a new Supabase user with email and password
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Automatically confirm email
      });

      if (authError) throw authError; // Handle authentication error

      const golferID = userData.user?.id; // Retrieve the user ID from the created user
      const { error: insertError } = await supabase
        .from('golfers')
        .insert([{ GolferID: golferID, name, handicap: parseInt(handicap), progress }]);

      if (insertError) throw insertError; // Handle error if insertion fails

      // Update golfers list with the newly added golfer
      setGolfers([{ GolferID: golferID, name, handicap: parseInt(handicap), progress, created_at: new Date().toISOString() }, ...golfers]);

      // Reset form inputs
      setName('');
      setHandicap('');
      setProgress('');
      setEmail('');
      setPassword('');

      Alert.alert('Success', 'Golfer account created successfully'); // Show success message
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error adding golfer', error.message); // Show error message if any
      }
    } finally {
      setLoading(false); // Set loading state to false
    }
  }

  // Function to update an existing golfer's details
  async function updateGolfer() {
    if (!selectedGolfer || !name || !handicap || !progress) {
      Alert.alert('Error', 'Please select a golfer and fill in all fields: Name, Handicap, and Progress.');
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      const { error } = await supabase
        .from('golfers')
        .update({ name, handicap: parseInt(handicap), progress })
        .eq('GolferID', selectedGolfer.GolferID); // Match GolferID to update the correct golfer

      if (error) throw error; // Handle error if update fails

      // Update golfers list to reflect changes
      setGolfers((prevGolfers) =>
        prevGolfers.map((g) =>
          g.GolferID === selectedGolfer.GolferID ? { ...g, name, handicap: parseInt(handicap), progress } : g
        )
      );

      // Reset selected golfer and form inputs
      setSelectedGolfer(null);
      setName('');
      setHandicap('');
      setProgress('');
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
        .from('golfers')
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
    setProgress(golfer.progress); // Set progress input
  }

  // Function to render each golfer item in the list
  const renderGolfer = ({ item }: { item: Golfer }) => (
    <ListItem bottomDivider onPress={() => selectGolfer(item)} containerStyle={styles.listItem}>
      <ListItem.Content>
        <ListItem.Title>{`Name: ${item.name}`}</ListItem.Title>
        <ListItem.Subtitle>{`Handicap: ${item.handicap}`}</ListItem.Subtitle>
        <ListItem.Subtitle>{`Progress: ${item.progress}`}</ListItem.Subtitle>
        <ListItem.Subtitle>{`Created At: ${new Date(item.created_at).toLocaleDateString()}`}</ListItem.Subtitle>
      </ListItem.Content>
      <Button title="Delete" buttonStyle={styles.deleteButton} onPress={() => deleteGolfer(item.GolferID)} />
    </ListItem>
  );

  return (
    // Linear gradient background
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>PGA Dashboard - Golfer Management</Text>

        {/* Input fields for golfer details */}
        <Input label="Name" value={name} onChangeText={setName} placeholder="Enter Name" containerStyle={styles.inputContainer} />
        <Input label="Handicap" value={handicap} keyboardType="numeric" onChangeText={setHandicap} placeholder="Enter Handicap" containerStyle={styles.inputContainer} />
        <Input label="Progress" value={progress} onChangeText={setProgress} placeholder="Enter Progress" containerStyle={styles.inputContainer} />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter Golfer's Email" containerStyle={styles.inputContainer} />
        <Input label="Password" value={password} secureTextEntry onChangeText={setPassword} placeholder="Enter Golfer's Password" containerStyle={styles.inputContainer} />

        {/* Button to add or update golfer */}
        <Button
          title={selectedGolfer ? 'Update Golfer' : 'Add Golfer'}
          onPress={() => (selectedGolfer ? updateGolfer() : addGolfer())}
          loading={loading}
          buttonStyle={styles.primaryButton}
        />

        {/* Button to navigate to log a lesson */}
        <Button title="Log a Lesson" onPress={() => navigation.navigate('LogLesson')} buttonStyle={styles.secondaryButton} />

        {/* FlatList to display golfers */}
        <FlatList
          data={golfers}
          keyExtractor={(item) => item.GolferID}
          renderItem={renderGolfer}
          scrollEnabled={false} // Disable FlatList scrolling to allow ScrollView to handle it
        />
      </ScrollView>
    </LinearGradient>
  );
}

// Styles for layout and design elements
//https://reactnative.dev/docs/style
// ChatGPT was used to optimize styling choices for buttons, list items, and input containers for visual consistency and improved UI aesthetics.

//This was done for account, auth and Pga dashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // ChatGPT recommended padding to improve layout spacing and overall screen balance.
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.textGreen,
     // Font size, weight, and color were chosen with ChatGPT's assistance to ensure readability and alignment with app color scheme.
  },
  inputContainer: {
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGray,
    paddingHorizontal: 8,
    backgroundColor: colors.inputBackground,
    // ChatGPT provided recommendations for padding, border radius, and background color to create a clean and consistent input style.
  },
  primaryButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    marginVertical: 10,
     // ChatGPT helped refine button styling to ensure the primary button stands out while maintaining consistency in border radius and spacing.
  },
  secondaryButton: {
    backgroundColor: colors.buttonGray,
    borderRadius: 8,
    marginVertical: 10,
    // ChatGPT recommended color and margin adjustments for visual consistency across button types.
  },
  deleteButton: {
    backgroundColor: colors.deleteRed,
    borderRadius: 8,
  },
  listItem: {
    borderRadius: 8,
    marginVertical: 5,
    padding: 10,
    backgroundColor: colors.inputBackground,
    // ChatGPT contributed to the styling of list items with padding, margin, and background color choices for improved visual appeal and separation.
  },
});
