import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FlatList } from 'react-native';
import { Card } from '@rneui/themed';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    fetchGolfers();
  }, []);

  async function fetchGolfers() {
    try {
      console.log('Fetching golfers from Supabase...');
      const { data, error } = await supabase.from('golfers1').select('GolferID, name');
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

  const renderDrillItem = ({ item }: { item: Drill }) => {
    const progress = item.goalValue
      ? ((item.golferValue ?? 0) / item.goalValue) * 100
      : 0;

    return (
      <Card containerStyle={styles.card}>
        <Text style={styles.drillName}>{item.name}</Text>
        <Text style={styles.metric}>
          PGA Standard: {item.goalValue ?? 'N/A'} {item.unit} | Latest Score: {item.golferValue ?? 'N/A'} {item.unit}
        </Text>
        <Text style={styles.progressText}>
          {progress >= 100
            ? '✅ You’ve reached the PGA standard!'
            : `📊 You're ${isNaN(progress) ? '0.00' : progress.toFixed(2)}% of the way to PGA level!`}
        </Text>
        <Button title="View All Past Results" onPress={() => console.log(`Fetching full history for ${item.name}`)} />
      </Card>
    );
  };

  return (
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

      <FlatList
        data={drills}
        keyExtractor={(item) => item.drill_id}
        renderItem={renderDrillItem}
        refreshing={loading}
        onRefresh={() => fetchDrillsAndBenchmarks(selectedGolfer || '', selectedCategory)}
      />
    </View>
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
});

