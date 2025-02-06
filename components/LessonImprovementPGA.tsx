import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import { Button } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// References
// Supabase Docs for JavaScript Select Queries https://supabase.com/docs/reference/javascript/select
// React Native Picker Tutorial: Create Dropdown Menus with Ease - The Don Hub https://www.youtube.com/watch?v=Lzhraj1EYz8
// React Native Chart Kit - Data Visualization for React Native Apps https://www.npmjs.com/package/react-native-chart-kit
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube, https://www.youtube.com/watch?v=4yVSwHO5QHU


const screenWidth = Dimensions.get('window').width;

// Define TypeScript interfaces for type safety
interface Golfer {
  id: string;
  name: string;
}

interface ImprovementData {
  dates: string[];
  scores: number[];
}

export default function LessonImprovementPGA() {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [selectedGolfer, setSelectedGolfer] = useState<string | null>(null);
  const [improvementData, setImprovementData] = useState<Record<string, ImprovementData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGolfers();
  }, []);

  // Fetch golfers from Supabase
  async function fetchGolfers() {
    try {
      const { data, error } = await supabase.from('golfers1').select('GolferID, name');
  
      if (error) throw new Error(error.message);
  
      // Rename GolferID to id for consistency in the component
      const formattedData = data.map((golfer: { GolferID: string; name: string }) => ({
        id: golfer.GolferID,
        name: golfer.name,
      }));
  
      setGolfers(formattedData);
    } catch (error) {
      Alert.alert('Error fetching golfers', (error as Error).message);
    }
  }

  // Fetch lesson improvement ratio
  async function fetchLessonImprovementRatio() {
    if (!selectedGolfer) {
      Alert.alert('Error', 'Please select a golfer.');
      return;
    }

    setLoading(true);

    try {
      console.log("Fetching lesson data for GolferID:", selectedGolfer);

      const { data: lessons, error: lessonError } = await supabase
        .from('Lesson1')
        .select('Lessonid, area, created_at')
        .eq('GolferID', selectedGolfer)
        .order('created_at', { ascending: true });

      if (lessonError) throw new Error(lessonError.message);

      console.log("Fetched Lessons:", lessons);

      if (!lessons || lessons.length === 0) {
        setImprovementData(null);
        setLoading(false);
        return;
      }

      let improvementPerArea: Record<string, ImprovementData> = {};

      for (const lesson of lessons) {
        console.log(`Fetching drills for lesson ${lesson.Lessonid} in area: ${lesson.area}`);

        const { data: drillResults, error: drillError } = await supabase
          .from('DrillResults1')
          .select('result, created_at, drills(category)')
          .eq('GolferID', selectedGolfer)
          .eq('drills.category', lesson.area)
          .order('created_at', { ascending: true });

        if (drillError) throw new Error(drillError.message);

        console.log(`Fetched drill results for lesson ${lesson.Lessonid}:`, drillResults);

        if (!drillResults || drillResults.length < 2) continue;

        const firstResult = drillResults[0].result;
        const lastResult = drillResults[drillResults.length - 1].result;
        const improvement = lastResult - firstResult;

        if (!improvementPerArea[lesson.area]) {
          improvementPerArea[lesson.area] = { dates: [], scores: [] };
        }

        improvementPerArea[lesson.area].dates.push(new Date(lesson.created_at).toLocaleDateString());
        improvementPerArea[lesson.area].scores.push(improvement);
      }

      console.log("Final Improvement Data:", improvementPerArea);
      setImprovementData(improvementPerArea);
      
    } catch (error) {
      Alert.alert('Error fetching lesson improvement', (error as Error).message);
    }

    setLoading(false);
  }

  return (
  <ScrollView keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <Text style={styles.title}>Lesson-to-Improvement Analysis</Text>

      {/* Golfer Selection */}
      <Picker selectedValue={selectedGolfer} onValueChange={(value) => setSelectedGolfer(value)} style={styles.picker}>
        <Picker.Item label="Select Golfer" value={null} />
        {golfers.map((golfer) => (
          <Picker.Item key={golfer.id} label={golfer.name} value={golfer.id} />
        ))}
      </Picker>

      <Button title="Analyze Improvement" onPress={fetchLessonImprovementRatio} buttonStyle={styles.button} />

      {/* Display Improvement Chart */}
      {improvementData && (
        <View>
          {Object.keys(improvementData).map((area) => (
            <View key={area}>
              <Text style={styles.chartTitle}>📊 {area} Improvement</Text>
              <LineChart
                data={{
                  labels: improvementData[area].dates,
                  datasets: [{ data: improvementData[area].scores }],
                }}
                width={screenWidth - 32}
                height={220}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                style={styles.chart}
              />
            </View>
          ))}
        </View>
      )}

      {loading && <Text>Loading...</Text>}
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F6F8', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10 },
  picker: { width: '100%', backgroundColor: 'white', marginVertical: 10 },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, marginVertical: 10 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
  chart: { marginTop: 20, borderRadius: 8, alignSelf: 'center' },
});
