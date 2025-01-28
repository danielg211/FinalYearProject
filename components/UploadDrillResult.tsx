import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';

// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU 

// React Native Tutorial 10 - FlatList https:www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge
// How to use an image picker | Universal App tutorial #4 expo, https://www.youtube.com/watch?v=iEQZU58naS8

// SupabaseTips "How to Configure Access Control on Your Supabase Storage Buckets." YouTube,
// https://www.youtube.com/watch?v=4ERX__Y908k

// Supabase Docs on Storage Buckets Fundamentals https://supabase.com/docs/guides/storage/buckets/fundamentals

// Expo Docs for Image Picker https://docs.expo.dev/versions/latest/sdk/imagepicker/

// Supabase Docs for JavaScript Select Queries https://supabase.com/docs/reference/javascript/select
interface Drill {
  label: string;
  value: string;
  targetMetric: string;
  unit: string;
  description: string;
  category: string;
  lessonId: string;
  pgaId: string;
}

export default function UploadDrillResult({ navigation }: any) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrills = async () => {
      try {
        console.log('Fetching session...');
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data.session;
        const golferId = session?.user?.id;
        if (!golferId) throw new Error('User not authenticated');
        console.log('Golfer ID:', golferId);

        console.log('Fetching assigned drills...');
        const { data: drillsData, error: drillsError } = await supabase
          .from('AssignedDrills')
          .select('drill_id, drills(name, targetMetric, unit, description, category), Lessonid, PGAID')
          .eq('GolferID', golferId)
          .eq('status', true)
          .order('created_at', { ascending: false });

        if (drillsError) throw drillsError;

        console.log('Raw drills data:', drillsData);
        if (drillsData && drillsData.length > 0) {
          const formattedDrills = drillsData.map((d: any) => ({
            label: d.drills.name,
            value: d.drill_id,
            targetMetric: d.drills.targetMetric,
            unit: d.drills.unit,
            description: d.drills.description,
            category: d.drills.category,
            lessonId: d.Lessonid,
            pgaId: d.PGAID,
          }));
          console.log('Formatted drills:', formattedDrills);
          setDrills(formattedDrills);
        } else {
          console.log('No drills found for this golfer.');
          setDrills([]);
        }
      } catch (error: any) {
        console.error('Error fetching drills:', error.message || error);
        Alert.alert('Error fetching drills', error.message || 'An error occurred');
      }
    };

    fetchDrills();
  }, []);

  const uploadMedia = async () => {
    if (!mediaUri || !mediaType) return null;

    try {
      const fileName = `${Date.now()}-${mediaType === 'image' ? 'jpg' : 'mp4'}`;
      const fileType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';

      console.log('Uploading media...');
      const { error: uploadError } = await supabase.storage
        .from('drill-media')
        .upload(fileName, { uri: mediaUri, type: fileType } as any);

      if (uploadError) throw uploadError;

      console.log('Fetching public URL...');
      const { data: publicUrlData } = supabase.storage.from('drill-media').getPublicUrl(fileName);
      return publicUrlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Error uploading media:', error.message || error);
      Alert.alert('Error uploading media', error.message || 'An error occurred');
      return null;
    }
  };

  const handleUploadResult = async () => {
    if (!selectedDrill || !resultValue) {
      Alert.alert('Error', 'Please select a drill and enter a result.');
      return;
    }

    try {
      const mediaUrl = await uploadMedia();

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const session = data.session;
      const golferId = session?.user?.id;
      if (!golferId) throw new Error('User not authenticated');

      const { error: insertError } = await supabase.from('DrillResults1').insert({
        GolferID: golferId,
        PGAID: selectedDrill.pgaId,
        LessonID: selectedDrill.lessonId,
        drill_id: selectedDrill.value,
        media_url: mediaUrl,
        result: parseFloat(resultValue),
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Drill result uploaded successfully!');
      setSelectedDrill(null);
      setResultValue('');
      setMediaUri(null);
      setMediaType(null);
    } catch (error: any) {
      console.error('Error uploading result:', error.message || error);
      Alert.alert('Error uploading result', error.message || 'An error occurred');
    }
  };

  const pickMedia = async () => {
    console.log('Opening media picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedAsset = result.assets[0];
      setMediaUri(selectedAsset.uri || null);
      setMediaType(selectedAsset.type === 'image' || selectedAsset.type === 'video' ? selectedAsset.type : null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Drill Result</Text>

      {drills.length > 0 ? (
        <FlatList
          data={drills}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.listItem, selectedDrill?.value === item.value ? styles.selectedListItem : null]}
              onPress={() => setSelectedDrill(item)}
            >
              <Text style={styles.listItemText}>{item.label}</Text>
              <Text style={styles.listItemSubText}>
                {item.targetMetric} ({item.unit})
              </Text>
              <Text style={styles.listItemSubText}>Area: {item.category}</Text>
              <Text style={styles.listItemSubText}>Description: {item.description}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>No drills available. Please contact your coach.</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter your result"
        value={resultValue}
        onChangeText={setResultValue}
        keyboardType="numeric"
      />

      <Button title="Pick Media" onPress={pickMedia} buttonStyle={styles.button} />
      <Button title="Upload Result" onPress={handleUploadResult} buttonStyle={styles.button} />
      <Button
        title="Back to Dashboard"
        onPress={() => navigation.navigate('GolferDashboard')}
        buttonStyle={[styles.button, styles.backButton]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  listItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedListItem: {
    backgroundColor: '#D0F0C0',
    borderColor: '#4CAF50',
  },
  listItemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItemSubText: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
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
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#D32F2F',
  },
});
