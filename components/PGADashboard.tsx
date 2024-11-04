import React, { useState, useEffect } from 'react';
import { Alert, View, FlatList, StyleSheet, Text } from 'react-native';
import { Button, Input, ListItem } from '@rneui/themed';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App'; 
// Define the Golfer type based on the table structure
type Golfer = {
  GolferID: string; // UUID type, so we use string in TypeScript
  created_at: string;
  handicap: number;
  progress: string;
  name: string;
};

type PGADashboardNavigationProp = StackNavigationProp<RootStackParamList, 'PGADashboard'>; 

export default function PGADashboard() {

  const navigation = useNavigation<PGADashboardNavigationProp>();

  // State variables for golfer data and form inputs
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [name, setName] = useState<string>('');
  const [handicap, setHandicap] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [email, setEmail] = useState<string>(''); // Email input for golfer account
  const [password, setPassword] = useState<string>(''); // Password input for golfer account
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchGolfers();
  }, []);

  // Fetch golfers from Supabase
  async function fetchGolfers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('golfers')
        .select('GolferID, name, handicap, progress, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGolfers(data as Golfer[]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error fetching golfers', error.message);
        console.error('Error fetching golfers:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  // Add a new golfer to the database and create an auth user
  async function addGolfer() {
    if (!name || !handicap || !progress || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields: Name, Handicap, Progress, Email, and Password.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create a new user in the Supabase Auth system
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Step 2: Insert golfer-specific data into the `golfers` table
      const golferID = userData.user?.id;
      const { error: insertError } = await supabase
        .from('golfers')
        .insert([{ GolferID: golferID, name, handicap: parseInt(handicap), progress }]);

      if (insertError) throw insertError;

      // Update local state with the new golfer
      setGolfers([{ GolferID: golferID, name, handicap: parseInt(handicap), progress, created_at: new Date().toISOString() }, ...golfers]);
      
      // Clear input fields
      setName('');
      setHandicap('');
      setProgress('');
      setEmail('');
      setPassword('');

      Alert.alert('Success', 'Golfer account created successfully');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error adding golfer', error.message);
        console.error('Error adding golfer:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  // Update golfer information in the database
  async function updateGolfer() {
    if (!selectedGolfer || !name || !handicap || !progress) {
      Alert.alert('Error', 'Please select a golfer and fill in all fields: Name, Handicap, and Progress.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('golfers')
        .update({ name, handicap: parseInt(handicap), progress })
        .eq('GolferID', selectedGolfer.GolferID);

      if (error) throw error;

      // Update local state
      setGolfers((prevGolfers) =>
        prevGolfers.map((g) =>
          g.GolferID === selectedGolfer.GolferID ? { ...g, name, handicap: parseInt(handicap), progress } : g
        )
      );

      // Reset selected golfer and input fields
      setSelectedGolfer(null);
      setName('');
      setHandicap('');
      setProgress('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error updating golfer', error.message);
        console.error('Error updating golfer:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  // Delete a golfer from the database
  async function deleteGolfer(golferID: string) {
    try {
      const { error } = await supabase
        .from('golfers')
        .delete()
        .eq('GolferID', golferID);

      if (error) throw error;

      // Update local state to remove deleted golfer
      setGolfers(golfers.filter((g) => g.GolferID !== golferID));
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error deleting golfer', error.message);
        console.error('Error deleting golfer:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  // Select a golfer for editing
  function selectGolfer(golfer: Golfer) {
    setSelectedGolfer(golfer);
    setName(golfer.name);
    setHandicap(golfer.handicap.toString());
    setProgress(golfer.progress);
  }

  // Render golfer items in the list
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
      
      <Input label="Name" value={name} onChangeText={setName} placeholder="Enter Name" />
      <Input label="Handicap" value={handicap} keyboardType="numeric" onChangeText={setHandicap} placeholder="Enter Handicap" />
      <Input label="Progress" value={progress} onChangeText={setProgress} placeholder="Enter Progress" />
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="Enter Golfer's Email" />
      <Input label="Password" value={password} secureTextEntry onChangeText={setPassword} placeholder="Enter Golfer's Password" />

      <Button title={selectedGolfer ? 'Update Golfer' : 'Add Golfer'} onPress={addGolfer} loading={loading} containerStyle={styles.button} />
      <Button title="Log a Lesson" onPress={() => navigation.navigate('LogLesson')}
/>

      <FlatList data={golfers} keyExtractor={(item) => item.GolferID} renderItem={renderGolfer} />
    </View>
  );
}

// Styles
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
