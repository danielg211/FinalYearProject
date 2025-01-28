import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import RNPickerSelect from 'react-native-picker-select';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Interfaces
interface Golfer {
  label: string;
  value: string;
}

interface Drill {
  label: string;
  value: string;
}

interface ProgressionData {
  results: number[];
  dates: string[];
}

export default function ViewProgressionPGA() {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [selectedGolfer, setSelectedGolfer] = useState<string | null>(null);
  const [drillAreas, setDrillAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [progressionData, setProgressionData] = useState<ProgressionData>({ results: [], dates: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGolfers = async () => {
      try {
        console.log('Fetching golfers...');
        const { data, error } = await supabase.from('golfers1').select('GolferID, name');
        if (error) throw error;

        console.log('Golfers fetched:', data);
        setGolfers(
          data.map((golfer: any) => ({
            label: golfer.name,
            value: golfer.GolferID,
          }))
        );
      } catch (error: any) {
        console.error('Error fetching golfers:', error.message || error);
        Alert.alert('Error fetching golfers', error.message || 'An unknown error occurred');
      }
    };

    fetchGolfers();
  }, []);

  const fetchDrillAreas = async () => {
    if (!selectedGolfer) {
      Alert.alert('Error', 'Please select a golfer first.');
      return;
    }

    try {
      console.log('Fetching drill areas for golfer:', selectedGolfer);
      const { data, error } = await supabase
        .from('Lesson1')
        .select('area')
        .eq('GolferID', selectedGolfer);

      if (error) throw error;

      const uniqueAreas = Array.from(new Set(data.map((lesson: any) => lesson.area)));
      console.log('Drill areas fetched:', uniqueAreas);
      setDrillAreas(uniqueAreas);
    } catch (error: any) {
      console.error('Error fetching drill areas:', error.message || error);
      Alert.alert('Error fetching drill areas', error.message || 'An unknown error occurred');
    }
  };

  const fetchDrills = async () => {
    if (!selectedGolfer || !selectedArea) {
      Alert.alert('Error', 'Please select a golfer and drill area first.');
      return;
    }

    try {
      console.log('Fetching drills for area:', selectedArea);
      const { data, error } = await supabase
        .from('DrillResults1')
        .select(`
          drill_id,
          drills!inner(name)
        `)
        .eq('GolferID', selectedGolfer);

      if (error) throw error;

      // Use a Map to ensure unique drill names while keeping drill_id references
      const drillMap = new Map();
      data.forEach((drill: any) => {
        if (!drillMap.has(drill.drills.name)) {
          drillMap.set(drill.drills.name, { 
            label: drill.drills.name, // Show only one per drill type
            value: drill.drill_id // Keep drill_id reference to fetch data correctly
          });
        }
      });

      const uniqueDrills = Array.from(drillMap.values());

      console.log('Unique drills fetched:', uniqueDrills);
      setDrills(uniqueDrills);
    } catch (error: any) {
      console.error('Error fetching drills:', error.message || error);
      Alert.alert('Error fetching drills', error.message || 'An unknown error occurred');
    }
  };

  const fetchProgressionData = async () => {
    if (!selectedGolfer || !selectedDrill) {
      Alert.alert('Error', 'Please select a golfer and drill first.');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching progression data for drill:', selectedDrill);
      const { data, error } = await supabase
        .from('DrillResults1')
        .select('created_at, result')
        .eq('GolferID', selectedGolfer)
        .eq('drill_id', selectedDrill);

      if (error) throw error;

      console.log('Progression data fetched:', data);
      const results = data.map((item: any) => item.result);
      const dates = data.map((item: any) => new Date(item.created_at).toLocaleDateString());

      setProgressionData({ results, dates });
    } catch (error: any) {
      console.error('Error fetching progression data:', error.message || error);
      Alert.alert('Error fetching progression data', error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>View Golfer Progression</Text>

      <RNPickerSelect
        onValueChange={(value) => {
          console.log('Selected golfer:', value);
          setSelectedGolfer(value);
          setDrillAreas([]);
          setDrills([]);
          setProgressionData({ results: [], dates: [] });
        }}
        items={golfers}
        placeholder={{ label: 'Select Golfer', value: null }}
      />

      <Button
        title="Fetch Drill Areas"
        onPress={fetchDrillAreas}
        disabled={!selectedGolfer}
        buttonStyle={styles.button}
      />

      {drillAreas.length > 0 && (
        <RNPickerSelect
          onValueChange={(value) => {
            console.log('Selected drill area:', value);
            setSelectedArea(value);
            setDrills([]);
            setProgressionData({ results: [], dates: [] });
          }}
          items={drillAreas.map((area) => ({ label: area, value: area }))}
          placeholder={{ label: 'Select Drill Area', value: null }}
        />
      )}

      <Button
        title="Fetch Drills"
        onPress={fetchDrills}
        disabled={!selectedArea}
        buttonStyle={styles.button}
      />

      {drills.length > 0 && (
        <RNPickerSelect
          onValueChange={(value) => {
            console.log('Selected drill:', value);
            setSelectedDrill(value);
            setProgressionData({ results: [], dates: [] });
          }}
          items={drills}
          placeholder={{ label: 'Select Drill', value: null }}
        />
      )}

      <Button
        title="Fetch Progression Data"
        onPress={fetchProgressionData}
        disabled={!selectedDrill}
        buttonStyle={styles.button}
      />

      {progressionData.results.length > 0 && (
        <LineChart
          data={{
            labels: progressionData.dates,
            datasets: [{ data: progressionData.results }],
          }}
          width={screenWidth - 32}
          height={220}
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    alignItems: 'center', // Center everything horizontally
    justifyContent: 'center', // Center everything vertically
    maxWidth: 500, // Prevents stretching on large screens
    alignSelf: 'center', // Centers the component itself
    width: '100%',},

  header: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20, textAlign: 'center' },
  chart: {
    marginTop: 20,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400, // Limits chart width
  },
  picker: {
    width: 300,  // Set a fixed width for dropdowns
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 10,
    width: 300,  // Prevent full width stretching
  },
  
});
