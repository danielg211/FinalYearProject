import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';

// Same logic as PGA Dashboard
// Uses same video as PGA Dashboard 
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU
// Create logic


export default function CreateDrills() {
  // State variables to manage the form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const createDrill = async () => {
    // Validate input fields
    if (!name || !description || !category) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
       // Insert the new drill into the database
      const { error } = await supabase.from('drills').insert([{ name, description, category }]);
      if (error) throw error;

      // Show success message and reset form fields
      Alert.alert('Success', 'Drill created successfully!');
      setName('');
      setDescription('');
      setCategory('');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error creating drill', error.message);
      } else {
        Alert.alert('Error creating drill', 'An unknown error occurred.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a New Drill</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Drill Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Drill Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Driving, Putting)"
        value={category}
        onChangeText={setCategory}
      />

      <Button
        title="Create Drill"
        onPress={createDrill}
        buttonStyle={styles.button}
      />
    </View>
  );
}

//chatgpt for styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
  },
});
