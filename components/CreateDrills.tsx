import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

// Same logic as PGA Dashboard
// Uses same video as PGA Dashboard 
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU
// Create logic


export default function CreateDrills() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [unit, setUnit] = useState('');
  const [goalValue, setGoalValue] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const navigation = useNavigation();

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type || null);
    }
  };

  const uploadMedia = async () => {
    if (!mediaUri || !mediaType) return null;
  
    try {
      // Convert the URI into a blob or file
      const response = await fetch(mediaUri);
      const blob = await response.blob();
  
      // Generate a file name
      const fileName = `${Date.now()}-${name}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
  
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('drill-media')
        .upload(fileName, blob, {
          contentType: mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
        });
  
      if (error) {
        throw new Error('Failed to upload media.');
      }
  
      // Retrieve the public URL
      const { data: publicUrlData } = supabase.storage
        .from('drill-media')
        .getPublicUrl(fileName);
  
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Media upload error:', error);
      throw new Error('Media upload failed.');
    }
  };
  

  const createDrill = async () => {
    if (!name || !description || !category || !targetMetric || !unit || !goalValue) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      let mediaUrl: string | null = null;
      if (mediaUri) {
        mediaUrl = await uploadMedia();
      }

      const { error } = await supabase.from('drills').insert([
        {
          name,
          description,
          category,
          targetMetric,
          unit,
          goalValue: parseFloat(goalValue),
          mediaUrl,
          mediaType,
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Drill created successfully!');
      resetForm();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setTargetMetric('');
    setUnit('');
    setGoalValue('');
    setMediaUri(null);
    setMediaType(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create a New Drill</Text>

      <TextInput
        style={styles.input}
        placeholder="Drill Name"
        value={name}
        onChangeText={setName}
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

      <TextInput
        style={styles.input}
        placeholder="Target Metric (e.g., Accuracy, Distance)"
        value={targetMetric}
        onChangeText={setTargetMetric}
      />

      <TextInput
        style={styles.input}
        placeholder="Unit (e.g., % or meters)"
        value={unit}
        onChangeText={setUnit}
      />

      <TextInput
        style={styles.input}
        placeholder="Goal Value (e.g., 80)"
        value={goalValue}
        onChangeText={setGoalValue}
        keyboardType="numeric"
      />

      <Button
        title="Pick Media"
        onPress={pickMedia}
        buttonStyle={styles.button}
      />

      {mediaUri && <Text style={styles.mediaText}>Media Selected: {mediaUri.split('/').pop()}</Text>}

      <Button
        title="Create Drill"
        onPress={createDrill}
        buttonStyle={styles.button}
      />

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#9E9E9E',
  },
  mediaText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
});
