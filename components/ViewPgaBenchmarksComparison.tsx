import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Button, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FlatList } from 'react-native';
import { Card } from '@rneui/themed';
import { supabase } from '../lib/supabase';
//import { LinearProgress } from '@rneui/themed';
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

// References

// Supabase Docs for JavaScript Select Queries https://supabase.com/docs/reference/javascript/select
// React Native Picker Tutorial: Create Dropdown Menus with Ease - The Don Hub https://www.youtube.com/watch?v=Lzhraj1EYz8
// React Native Chart Kit - Data Visualization for React Native Apps https://www.npmjs.com/package/react-native-chart-kit
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube, https://www.youtube.com/watch?v=4yVSwHO5QHU
// Abhirup Datta #1 Installation and Bar Chart - chart kit react-native library https://www.youtube.com/watch?v=dlpn8bWJgkw
// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge
// Filter Product List by Category using React Native Dropdown Picker, The Web Designer https://www.youtube.com/watch?v=AWB_x9Fb3vM
// Supabase Table Management https://supabase.com/docs/guides/database/tables?queryGroups=database-method&database-method=dashboard&queryGroups=language&language=sql

// Interfaces
interface Golfer {
  GolferID: string;
  name: string;
}

interface Drill {
  drill_id: string;
  name: string;
  category: string;
  targetMetric: string;
  unit: string;
  benchmark_id: string | null;
  golferValue?: number;
  goalValue?: number;
}

interface Benchmark {
  benchmark_id: string;
  target_value: number;
  unit: string;
}


const categories = ['Driving', 'Iron Play', 'Short Game', 'Putting'];



export default function ViewPgaBenchmarksComparison() {
  const [selectedGolfer, setSelectedGolfer] = useState<string | null>(null);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTourPro, setSelectedTourPro] = useState<string | null>(null);
  const [tourPros, setTourPros] = useState<string[]>([]);
  const proNames = tourPros.map((pro: string) => pro);
  const [proDrillData, setProDrillData] = useState<Drill[]>([]);
  const [showProComparison, setShowProComparison] = useState<boolean>(false);
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);

  
  useEffect(() => {
    fetchGolfers();
  }, []);

  async function fetchGolfers() {
    try {

      console.log('Fetching session...');
      
               // Get the logged-in PGA professional's user ID
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData?.session?.user) {
              throw new Error("Unable to retrieve authenticated PGA Professional. Please log in again.");
            }
      
            const PGAID = sessionData.session.user.id; // Get PGA professional's ID
            console.log(`Fetching golfers for PGA Pro: ${PGAID}`);
      



      console.log('Fetching golfers from Supabase...');

      const { data, error } = await supabase
      .from('golfers1')
      .select('GolferID, name')
      .eq('PGAID', PGAID);
      
      if (error) throw error;
      console.log('Golfers fetched:', data);
      setGolfers(data);
    } catch (error) {
      console.error('Error fetching golfers:', error);
      Alert.alert('Error fetching golfers', (error as Error).message);
    }
  }

  useEffect(() => {
    if (selectedGolfer) fetchDrillsAndBenchmarks(selectedGolfer, selectedCategory);
  }, [selectedGolfer, selectedCategory]);

  useEffect(() => {
    const fetchTourPros = async () => {
      try {
        const { data, error } = await supabase
          .from("tour_pros")
          .select("name");

        if (error) {
          console.error('Error fetching tour pro names:', error);
          return;
        }

        // Use Set to extract unique names
        const proNames = Array.from(
          new Set(data?.map((pro: { name: string }) => pro.name))
        );
        setTourPros(proNames);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchTourPros();
  }, []);

  // Trigger fetch for PGA Pro Drill Data
useEffect(() => {
  if (selectedTourPro && selectedCategory) {
    fetchProDrills(selectedTourPro, selectedCategory);
  }
  
console.log("Driving Drills in UI:", drills.map((d) => d.drill_id));

}, [selectedTourPro, selectedCategory]);

const filteredDrills = selectedDrill
  ? drills.filter((drill) => drill.drill_id === selectedDrill)
  : drills;


  async function fetchDrillsAndBenchmarks(golferId: string, category: string) {
    setLoading(true);
    try {
      console.log(`Fetching drills for category: ${category}`);

      // Fetch drills with benchmark IDs
      const { data: drillsData, error: drillsError } = await supabase
        .from('drills')
        .select('drill_id, name, category, targetMetric, unit, benchmark_id')
        .eq('category', category);

      if (drillsError) throw drillsError;
      console.log('Drills fetched:', drillsData);

      // Fetch PGA Benchmarks
      const benchmarkIds = drillsData.map((drill) => drill.benchmark_id).filter(Boolean);
      const { data: benchmarksData, error: benchmarksError } = await supabase
        .from('pga_benchmarks')
        .select('benchmark_id, target_value, unit')
        .in('benchmark_id', benchmarkIds);

      if (benchmarksError) throw benchmarksError;
      console.log('Benchmarks fetched:', benchmarksData);

      // Fetch Golfer's Drill Results
      const { data: drillResults, error: resultsError } = await supabase
        .from('DrillResults1')
        .select('drill_id, result')
        .eq('GolferID', golferId)
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;
      console.log('Drill Results fetched:', drillResults);

      // Create a map of latest drill results
      const latestDrillResults: Record<string, number> = {};
      drillResults.forEach((entry) => {
        if (!latestDrillResults[entry.drill_id]) {
          latestDrillResults[entry.drill_id] = entry.result;
        }
      });

      // Merge Drill Data with Benchmarks & Golfer Results
      const drillsWithData = drillsData
        .map((drill) => {
          const benchmark = benchmarksData.find((b) => b.benchmark_id === drill.benchmark_id);
          return {
            ...drill,
            goalValue: benchmark ? benchmark.target_value : undefined,
            unit: benchmark ? benchmark.unit : drill.unit,
            golferValue: latestDrillResults[drill.drill_id] || undefined,
          };
        })
        .filter((drill) => drill.golferValue !== undefined); // Only show drills with golfer data

      console.log('Final Drill Data with PGA Standards:', drillsWithData);
      setDrills(drillsWithData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error fetching data', (error as Error).message);
    }
    setLoading(false);
  }
  async function fetchProDrills(proName: string, category: string) {
    try {
      const { data, error } = await supabase
  .from('tour_pros')
  .select('*')  // Fetch all fields for debugging
  .eq('name', proName)
  .eq('Category', category);

if (error) {
  console.error('Error fetching PGA Pro drills:', error);
  Alert.alert('Error', 'Could not fetch PGA professional data');
  return;
}

console.log('Fetched PGA Pro Data:', data);

const availableDrillIDs = new Set(data.map((pro) => pro.drill_id.toLowerCase().trim()));
console.log('Available PGA Drill IDs:', [...availableDrillIDs]);

const formattedProDrills: Drill[] = data.map((drill) => ({
  drill_id: drill.drill_id,
  name: drill.stat_category ?? 'Unnamed Drill',
  golferValue: drill.stat_value ?? 0,
  category: drill.Category ?? category,
  unit: drill.stat_category?.includes('Distance') ? 'yards' : 'feet',
  targetMetric: '',
  benchmark_id: null,
  goalValue: undefined,
}));

console.log('Formatted PGA Pro Drills:', formattedProDrills);
setProDrillData(formattedProDrills);

    } catch (error) {
      console.error('Error fetching PGA Pro drills:', error);
      Alert.alert('Error', 'Could not fetch PGA professional data');
    }
  }
   // Chatgpt helped with logic
  const renderDrillItem = ({ item }: { item: Drill }) => { 
    let progress = 0;
    let differenceMessage = '';
     // Get PGA Pro data if a Tour Pro is selected
    const proStat = selectedTourPro
    ? proDrillData.find((proItem) => proItem.drill_id === item.drill_id)
    : null;  // Null if no Tour Pro is selected

    const golferStat = item.golferValue ?? 'N/A';
    const proStatValue = proStat?.golferValue ?? 'N/A';

    const golferStatNum = Number(item.golferValue) || 0;
    //const proStatNum = Number(proStat?.golferValue) || 0;
    const proStatNum = proStat ? Number(proStat.golferValue) || 0 : null;
    const pgaAverage = Number(item.goalValue) || 0;

    if (!pgaAverage || golferStatNum === 0) return null; // Ensure valid data

    const isFeetMeasure = item.unit.toLowerCase() === "feet";
  
    
    const golferScore = isFeetMeasure ? golferStatNum : golferStatNum;
    //const proScore = isFeetMeasure ? proStatNum : proStatNum;
    const proScore = proStatNum ?? 0;
    // If no Tour Pro is selected, default to comparing against PGA Tour Average only
   // const maxScore = Math.max(golferScore, pgaAverage, proStatNum || 0) + 5;
   const maxScore = selectedTourPro
    ? Math.max(golferScore, pgaAverage, proScore) + 5
    : Math.max(golferScore, pgaAverage) + 5;
  
    //const maxScore = Math.max(golferScore, proScore, pgaAverage) + 5;
    
    if (!proStat) {
      console.warn(`No PGA Pro data found for drill_id: ${item.drill_id}. Check if it exists in 'tour_pros' table.`);
      return null;  // Prevents rendering if no data is found
    }
      
    const comparisonProgress = Math.min(
      (item.golferValue ?? 0) / (proStat?.golferValue ?? 1),
      1
    );
  
    // Calculate progress based on the unit type
    if (item.goalValue && item.golferValue) {
      if (item.unit.toLowerCase() === "feet") {
        // Lower is better for feet-based proximity metrics
        progress = item.golferValue <= item.goalValue 
          ? 100 
          : (item.goalValue / item.golferValue) * 100;
  
        const diff = item.goalValue - item.golferValue;
        differenceMessage = diff > 0 
          ? `🏆 ${Math.abs(diff).toFixed(2)} feet better than PGA standard!`
          : `📉 ${Math.abs(diff).toFixed(2)} feet behind the PGA standard.`;
  
        } else {
        // Higher is better for other metrics (e.g., driving distance, accuracy)
        progress = (item.golferValue / item.goalValue) * 100;
  
        const diff = item.golferValue - item.goalValue;
        differenceMessage = diff > 0 
          ? `🏆 ${Math.abs(diff).toFixed(2)} ${item.unit} above PGA standard!`
          : `📉 ${Math.abs(diff).toFixed(2)} ${item.unit} below PGA standard.`;
      }
    }
  
    const progressValue = Math.round(Math.max(0, Math.min(1, Number(progress / 100) || 0)) * 100) / 100;

    if (isNaN(progressValue)) {
      console.warn(`Invalid progress value for drill: ${item.drill_id}, golferValue: ${item.golferValue}, goalValue: ${item.goalValue}`);
    }

  
    return (
      <Card containerStyle={styles.card}>
        <Text style={styles.drillName}>{item.name}</Text>
  
        {/* PGA Tour Average vs Golfer Score */}
        <Text style={styles.metric}>
          <Text style={styles.boldText}>🎯 PGA Tour Average:</Text> {item.goalValue ?? 'N/A'} {item.unit}{"\n"}
          <Text style={styles.boldText}>🏌️ Golfer's Score:</Text> {item.golferValue ?? 'N/A'} {item.unit}
        </Text>
  
        {/* Only show Tour Pro stats if one is selected */}
        {selectedTourPro && (
          <Text style={styles.metric}>
            <Text style={styles.boldText}>🏅 {selectedTourPro}'s Score:</Text> {proStatValue} {item.unit}
          </Text>
        )}
  
        {/* Bar Chart Comparison */}
        <View>
          <Text style={styles.chartTitle}>Comparison</Text>
          <BarChart
            data={{
              labels: selectedTourPro ? ["Golfer", "PGA Average", selectedTourPro] : ["Golfer", "PGA Average"],
              datasets: [{
                data: selectedTourPro
                  ? [golferScore, pgaAverage, proScore]
                  : [golferScore, pgaAverage]
              }],
            }}
            width={screenWidth - 50}
            height={220}
            yAxisLabel=" "
            yAxisSuffix={` ${item.unit}`}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            showValuesOnTopOfBars
            fromZero
            yAxisInterval={1} 
          />
        </View>
  
        <Text style={styles.infoMessage}>
          {isFeetMeasure
            ? "🔹 Lower values indicate better performance (closer to the hole)."
            : "🔹 Higher values indicate better performance."}
        </Text>
  
        {/* Difference Message */}
        <Text style={[styles.progressText, { color: differenceMessage.includes("behind") ? "red" : "green" }]}>
          {differenceMessage}
        </Text>
      </Card>
    );
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <Text style={styles.title}>🏌️‍♂️ PGA Benchmarks Comparison</Text>

      <Picker selectedValue={selectedGolfer} onValueChange={setSelectedGolfer} style={styles.picker}>
        <Picker.Item label="Select Golfer" value={null} />
        {golfers.map((golfer) => (
          <Picker.Item key={golfer.GolferID} label={golfer.name} value={golfer.GolferID} />
        ))}
      </Picker>

      <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.picker}>
        {categories.map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>

            <Picker
        selectedValue={selectedDrill}
        onValueChange={(value) => setSelectedDrill(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Drill" value={null} />
        {drills.map((drill) => (
          <Picker.Item key={drill.drill_id} label={drill.name} value={drill.drill_id} />
        ))}
      </Picker>


            <Picker
        selectedValue={selectedTourPro}
        onValueChange={(value) => setSelectedTourPro(value)}
        style={styles.picker}
      >
        {/* <Picker.Item label="Compare to PGA Tour Average (No Tour Pro Selected)" value={null} /> */}

        {tourPros.map((pro) => (
          <Picker.Item key={pro} label={pro} value={pro} />
        ))}
      </Picker>

      <FlatList
        data={filteredDrills}
        keyExtractor={(item) => item.drill_id}
        renderItem={renderDrillItem}
        refreshing={loading}
        onRefresh={() => fetchDrillsAndBenchmarks(selectedGolfer || '', selectedCategory)}
      />
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F6F8', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10 },
  picker: { width: '100%', backgroundColor: 'white', marginVertical: 10 },
  card: { width: '90%', padding: 15, borderRadius: 8 },
  drillName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  metric: { fontSize: 16, color: '#555' },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginTop: 5 },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#333"
  },
  infoMessage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2", // Blue color for better visibility
    textAlign: "center",
    marginTop: 10,
    backgroundColor: "#EAF2FF", // Light blue background for contrast
    padding: 8,
    borderRadius: 5,
    width: "100%",
  },
});

