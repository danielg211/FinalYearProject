import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LogLesson() {
  const [feedback, setFeedback] = useState('');
  const [drillsAssigned, setDrillsAssigned] = useState('');
  const [golferId, setGolferId] = useState('');
  const [userId, setUserId] = useState('');

  // Fetch the logged-in user's ID from profiles table on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
        } else if (profileData) {
          setUserId(profileData.id); // Set PGAID to the profile's ID
        }
      }
    };
    fetchUser();
  }, []);

  // Function to handle logging a lesson
  async function logLesson() {
    console.log('Feedback:', feedback);
    console.log('Drills Assigned:', drillsAssigned);
    console.log('Golfer ID:', golferId);
    console.log('PGA ID (User ID from profiles):', userId);

    try {
      const { data, error } = await supabase.from('Lesson').insert([
        {
          feedback: feedback,
          drillsAssigned: drillsAssigned,
          GolferID: golferId,
          PGAID: userId, // Use the fetched PGA Pro's ID from profiles
        }
      ]);

      if (error) {
        console.error('Error logging lesson:', error.message); // Detailed error logging
        throw error;
      }
      console.log('Insert result:', data); // Log result of insert operation
      Alert.alert('Lesson logged successfully!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error logging lesson:', error.message);
      } else {
        Alert.alert('An unknown error occurred.');
      }
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Feedback:</Text>
      <TextInput
        placeholder="Enter feedback"
        value={feedback}
        onChangeText={setFeedback}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />

      <Text>Drills Assigned:</Text>
      <TextInput
        placeholder="Drills assigned"
        value={drillsAssigned}
        onChangeText={setDrillsAssigned}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />

      <Text>Golfer ID:</Text>
      <TextInput
        placeholder="Enter Golfer ID"
        value={golferId}
        onChangeText={setGolferId}
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />

      <Button title="Log Lesson" onPress={logLesson} />
    </View>
  );
}
