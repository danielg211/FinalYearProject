import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';

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
  const [performanceTrend, setPerformanceTrend] = useState<string | null>(null);
  const [trendColor, setTrendColor] = useState<string>("#757575"); // Default gray


  useEffect(() => {
    const fetchGolfers = async () => {
      try {
        console.log('Fetching golfers...');
        const { data, error } = await supabase.from('golfers1').select('GolferID, name');
        if (error) throw error;

        console.log('Golfers fetched:', data);
        setGolfers(data.map((golfer: any) => ({ label: golfer.name, value: golfer.GolferID })));
      } catch (error: any) {
        console.error('Error fetching golfers:', error.message || error);
        Alert.alert('Error fetching golfers', error.message || 'An unknown error occurred');
      }
    };

    fetchGolfers();
  }, []);

  useEffect(() => {
    if (performanceTrend) {
      setTrendColor((prev) => {
        console.log("Final Applied Trend Color:", prev);
        return prev;
      });
    }
  }, [performanceTrend]);
  
  const fetchDrillAreas = async () => {
    if (!selectedGolfer) {
      Alert.alert('Error', 'Please select a golfer first.');
      return;
    }

    try {
      console.log('Fetching drill areas for golfer:', selectedGolfer);
      const { data, error } = await supabase.from('Lesson1').select('area').eq('GolferID', selectedGolfer);
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
      const { data, error } = await supabase.from('DrillResults1').select('drill_id, drills!inner(name)').eq('GolferID', selectedGolfer);
      if (error) throw error;

      const uniqueDrills = Array.from(new Set(data.map((drill: any) => ({ label: drill.drills.name, value: drill.drill_id }))));
      console.log('Drills fetched:', uniqueDrills);
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
  
      // Calculate Performance Trend
      if (results.length > 1) {
        const latestResult = results[results.length - 1];
        const prevResult = results[results.length - 2];
  
        const change = prevResult ? (((latestResult - prevResult) / prevResult) * 100).toFixed(2) : 'N/A';
        const trendText = change !== 'N/A' ? (latestResult > prevResult ? 'Improved' : 'Declined') : 'N/A';
  
        console.log(`Performance Change: ${change}% (${trendText})`);
        setPerformanceTrend(`Performance Change: ${change}% (${trendText})`);
  
        console.log("Latest Result:", latestResult);
        console.log("Previous Result:", prevResult);
        console.log("Change:", change);
        console.log("Trend Text:", trendText);
        console.log("Trend Color Before Setting:", latestResult > prevResult ? '#4CAF50' : latestResult < prevResult ? '#D32F2F' : '#757575');

        // Set Trend Color for the Graph
        setTrendColor(latestResult > prevResult ? '#4CAF50' : latestResult < prevResult ? '#D32F2F' : '#757575');
      } else {
        setPerformanceTrend('Not enough data for trend analysis');
        console.log("Final Applied Trend Color:", trendColor);
        setTrendColor('#757575'); // Default to gray
      }
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

      {/* Golfer Selection */}
      <Picker selectedValue={selectedGolfer} onValueChange={(value) => setSelectedGolfer(value)} style={styles.picker}>
        <Picker.Item label="Select Golfer" value={null} />
        {golfers.map((golfer) => (
          <Picker.Item key={golfer.value} label={golfer.label} value={golfer.value} />
        ))}
      </Picker>

      <Button title="Fetch Drill Areas" onPress={fetchDrillAreas} disabled={!selectedGolfer} buttonStyle={styles.button} />

      {drillAreas.length > 0 && (
        <Picker selectedValue={selectedArea} onValueChange={(value) => setSelectedArea(value)} style={styles.picker}>
          <Picker.Item label="Select Drill Area" value={null} />
          {drillAreas.map((area) => (
            <Picker.Item key={area} label={area} value={area} />
          ))}
        </Picker>
      )}

      <Button title="Fetch Drills" onPress={fetchDrills} disabled={!selectedArea} buttonStyle={styles.button} />

      {drills.length > 0 && (
        <Picker selectedValue={selectedDrill} onValueChange={(value) => setSelectedDrill(value)} style={styles.picker}>
          <Picker.Item label="Select Drill" value={null} />
          {drills.map((drill) => (
            <Picker.Item key={drill.value} label={drill.label} value={drill.value} />
          ))}
        </Picker>
      )}

      <Button title="Fetch Progression Data" onPress={fetchProgressionData} disabled={!selectedDrill} buttonStyle={styles.button} />

      {performanceTrend && <Text style={styles.performanceText}>{performanceTrend}</Text>}

      {progressionData.results.length > 0 && (
  <LineChart
  data={{
    labels: progressionData.dates,
    datasets: [
      { 
        data: progressionData.results,
        color: (opacity = 1) => trendColor, // Explicitly set dataset color
      }
    ],
  }}
  width={screenWidth - 32}
  height={220}
  yAxisSuffix="%"
  chartConfig={{
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: (opacity = 1) => trendColor, // Ensure trendColor is applied
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
    backgroundColor: '#f9f9f9' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#4CAF50', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  picker: { 
    height: 50, 
    backgroundColor: 'white', 
    marginVertical: 10 
  },
  button: { 
    backgroundColor: '#4CAF50', 
    borderRadius: 8, 
    paddingVertical: 12, 
    marginVertical: 10 
  },
  performanceText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginVertical: 10, 
    textAlign: 'center' 
  },
  chart: { 
    marginTop: 20, 
    borderRadius: 8, 
    alignSelf: 'center' 
  }
});

