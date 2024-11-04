import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';

interface Golfer {
  GolferID: string;
  name: string;
}

export default function LogLesson() {
  const [feedback, setFeedback] = useState('');
  const [drillsAssigned, setDrillsAssigned] = useState('');
  const [golferId, setGolferId] = useState('');
  const [userId, setUserId] = useState('');
  const [golfers, setGolfers] = useState<Golfer[]>([]); // Specify the type as Golfer array

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();

    const fetchGolfers = async () => {
      const { data, error } = await supabase.from('golfers').select('GolferID, name');
      if (error) {
        console.error('Error fetching golfers:', error.message);
      } else {
        setGolfers(data as Golfer[]); // Typecast data to Golfer array
      }
    };
    fetchGolfers();
  }, []);

  async function logLesson() {
    console.log('Feedback:', feedback);
    console.log('Drills Assigned:', drillsAssigned);
    console.log('Golfer ID:', golferId);
    console.log('PGA ID (User ID):', userId);

    try {
      const { data, error } = await supabase.from('Lesson').insert([
        {
          feedback: feedback,
          drillsAssigned: drillsAssigned,
          GolferID: golferId,
          PGAID: userId,
        }
      ]);

      if (error) {
        console.error('Error logging lesson:', error.message);
        throw error;
      }
      console.log('Insert result:', data);
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

      <Text>Select Golfer:</Text>
      <Picker
        selectedValue={golferId}
        onValueChange={(itemValue, itemIndex) => setGolferId(itemValue)}
        style={{ borderWidth: 1, marginVertical: 10 }}
      >
        <Picker.Item label="Select Golfer" value="" />
        {golfers.map((golfer) => (
          <Picker.Item key={golfer.GolferID} label={golfer.name} value={golfer.GolferID} />
        ))}
      </Picker>

      <Button title="Log Lesson" onPress={logLesson} />
    </View>
  );
}
