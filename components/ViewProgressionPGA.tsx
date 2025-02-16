import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, Alert, Dimensions, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import MultiSelect from 'react-native-multiple-select';
import { BarChart } from 'react-native-chart-kit';

// References
// Supabase Docs for JavaScript Select Queries https://supabase.com/docs/reference/javascript/select
// React Native Picker Tutorial: Create Dropdown Menus with Ease - The Don Hub https://www.youtube.com/watch?v=Lzhraj1EYz8
// React Native Chart Kit - Data Visualization for React Native Apps https://www.npmjs.com/package/react-native-chart-kit
// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube, https://www.youtube.com/watch?v=4yVSwHO5QHU
// React Native Multiple Select - Multi-Select Dropdown for React Native Apps. npm, https://www.npmjs.com/package/react-native-multiple-select. Accessed [Date].
// Abirhup Datta, "Line Chart, Stacked Bar Chart  - React Native Chart Kit Library." YouTube, https://www.youtube.com/watch?v=C6a6pmX4aLI. 
// Lirs Tech Tips, "React Native: Multiple Select (Using library react-native-multiple-select)." YouTube https://www.youtube.com/watch?v=hVUIAOs_7Pc

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
  const [selectedDrill, setSelectedDrill] = useState<string[]>([]);
  const [progressionData, setProgressionData] = useState<Record<string, ProgressionData>>({});
  const [loading, setLoading] = useState(false);
  const [performanceTrend, setPerformanceTrend] = useState<string | null>(null);
  const [trendColor, setTrendColor] = useState<string>("#757575"); // Default gray
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [worstScore, setWorstScore] = useState<number | null>(null);
  const [overallTrend, setOverallTrend] = useState<string | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [scoreDeviation, setScoreDeviation] = useState<number | null>(null);
  const [scoreDistribution, setScoreDistribution] = useState<Record<string, number>>({});


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
  
  useEffect(() => {
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
  fetchDrillAreas();
  }, [selectedGolfer]);


  useEffect(() => {
  const fetchDrills = async () => {
    if (!selectedGolfer || !selectedArea) {
      Alert.alert('Error', 'Please select a golfer and drill area first.');
      return;
    }
  
    try {
      console.log('Fetching drills for area:', selectedArea);
      const { data, error } = await supabase.from('DrillResults1')
        .select('drill_id, drills!inner(name)')
        .eq('GolferID', selectedGolfer)
        .eq('drills.category', selectedArea);
  
      if (error) throw error;
  
      //  Ensure uniqueness using a Map
      const uniqueDrillsMap = new Map();
      data.forEach((drill: any) => {
        uniqueDrillsMap.set(drill.drill_id, { label: drill.drills.name, value: drill.drill_id });
      });
  
      const uniqueDrills = Array.from(uniqueDrillsMap.values());
      console.log('Unique Drills fetched:', uniqueDrills);
      setDrills(uniqueDrills);
    } catch (error: any) {
      console.error('Error fetching drills:', error.message || error);
      Alert.alert('Error fetching drills', error.message || 'An unknown error occurred');
    }
  };
  fetchDrills();
}, [selectedArea]);
  
//Fetch Progression  ChatGPt formulas
// ChatGPT was utilized to formulate and optimize the statistical models 
// for performance trend analysis, and score distribution mapping. 
// The suggested mathematical models were then converted 
// into JavaScript functions to ensure correct implementation in the React Native codebase

useEffect(() => {
const fetchProgressionData = async () => {
  if (!selectedGolfer || selectedDrill.length === 0) {
    Alert.alert('Error', 'Please select a golfer and at least one drill.');
    return;
  }

  try {
    setLoading(true);
    console.log('Fetching progression data for drills:', selectedDrill);

    let newProgressionData: Record<string, ProgressionData> = {};
    let latestResults: number[] = [];
    let prevResults: number[] = [];

    for (const drillId of selectedDrill) {
      const { data, error } = await supabase
        .from('DrillResults1')
        .select('created_at, result')
        .eq('GolferID', selectedGolfer)
        .eq('drill_id', drillId);

      if (error) throw error;

      console.log(`Progression data fetched for drill ${drillId}:`, data);

      const results = data.map((item: any) => item.result);
      const dates = data.map((item: any) => new Date(item.created_at).toLocaleDateString());

      newProgressionData[drillId] = { results, dates };

      // Track latest and previous results for trend calculations
      if (results.length > 1) {
        latestResults.push(results[results.length - 1]);
        prevResults.push(results[results.length - 2]);
      }
    }

    setProgressionData(newProgressionData);

    // Extract all results across all selected drills
    console.log("New Progression Data:", newProgressionData);

    const allResults = Object.values(newProgressionData)
      .flatMap((data) => data.results ?? []);

    if (allResults.length > 0) {
      setBestScore(Math.max(...allResults));
      setWorstScore(Math.min(...allResults));

      //  Compute Average Score
      const total = allResults.reduce((sum, score) => sum + score, 0);
      setAverageScore(parseFloat((total / allResults.length).toFixed(2))); // Ensure numeric format

      //  Compute Standard Deviation
      const mean = total / allResults.length;
      const squaredDiffs = allResults.map(score => (score - mean) ** 2);
      const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / allResults.length;
      setScoreDeviation(parseFloat(Math.sqrt(variance).toFixed(2))); // Ensure numeric format

      //  Compute Score Distribution (grouping into 10-point ranges)
      const distribution: Record<string, number> = {};
      allResults.forEach(score => {
        const range = `${Math.floor(score / 10) * 10}-${Math.floor(score / 10) * 10 + 9}`;
        distribution[range] = (distribution[range] || 0) + 1;
      });
      setScoreDistribution(distribution);

      //  Determine overall trend
      const firstResult = allResults[0];
      const lastResult = allResults[allResults.length - 1];

      setOverallTrend(
        lastResult > firstResult ? "Improving 📈" :
        lastResult < firstResult ? "Declining 📉" : "Stable ⚖️"
      );
    } else {
      setBestScore(null);
      setWorstScore(null);
      setAverageScore(null);
      setScoreDeviation(null);
      setScoreDistribution({});
      setOverallTrend("Not enough data");
    }

    //  Calculate overall performance trend across all selected drills
    if (latestResults.length > 0 && prevResults.length > 0) {
      const totalLatest = latestResults.reduce((acc, val) => acc + val, 0) / latestResults.length;
      const totalPrev = prevResults.reduce((acc, val) => acc + val, 0) / prevResults.length;

      const change = totalPrev ? (((totalLatest - totalPrev) / totalPrev) * 100).toFixed(2) : 'N/A';
      const trendText = change !== 'N/A' ? (totalLatest > totalPrev ? 'Improved' : 'Declined') : 'N/A';

      console.log(`Overall Performance Change: ${change}% (${trendText})`);
      setPerformanceTrend(`Overall Performance Change: ${change}% (${trendText})`);
    } else {
      setPerformanceTrend('Not enough data for trend analysis');
    }

  } catch (error: any) {
    console.error('Error fetching progression data:', error.message || error);
    Alert.alert('Error fetching progression data', error.message || 'An unknown error occurred');
  } finally {
    setLoading(false);
  }
};
fetchProgressionData();
}, [selectedDrill]);

  
//Fetch Progression

//Render
return (
<ScrollView keyboardShouldPersistTaps="handled">
  <View style={styles.container}>
    <Text style={styles.header}>View Golfer Progression</Text>

    {/* Golfer Selection */}
    <Picker selectedValue={selectedGolfer} onValueChange={(value) => setSelectedGolfer(value)} style={styles.picker}>
      <Picker.Item label="Select Golfer" value={null} />
      {golfers.map((golfer) => (
        <Picker.Item key={golfer.value} label={golfer.label} value={golfer.value} />
      ))}
    </Picker>

   

    {drillAreas.length > 0 && (
      <Picker selectedValue={selectedArea} onValueChange={(value) => setSelectedArea(value)} style={styles.picker}>
        <Picker.Item label="Select Drill Area" value={null} />
        {drillAreas.map((area) => (
          <Picker.Item key={area} label={area} value={area} />
        ))}
      </Picker>
    )}

   

    {drills.length > 0 && (
      <MultiSelect
        items={drills}
        uniqueKey="value"
        onSelectedItemsChange={setSelectedDrill}
        selectedItems={selectedDrill}
        selectText="Search drills..."
        searchInputPlaceholderText="Search drills..."
        tagRemoveIconColor="#4CAF50"
        tagBorderColor="#4CAF50"
        tagTextColor="#4CAF50"
        selectedItemTextColor="#4CAF50"
        selectedItemIconColor="#4CAF50"
        itemTextColor="#000"
        displayKey="label"
        searchInputStyle={{ color: '#000' }}
        submitButtonColor="#4CAF50"
        submitButtonText="Submit"
      />
    )}

    

    {performanceTrend && <Text style={styles.performanceText}>{performanceTrend}</Text>}

    {/* Summary Section */}
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryText}>🏆 Best Score: {bestScore ?? 'N/A'}</Text>
      <Text style={styles.summaryText}>📉 Worst Score: {worstScore ?? 'N/A'}</Text>
      <Text style={styles.summaryText}>📊 Average Score: {averageScore ?? 'N/A'}</Text>
      <Text style={styles.summaryText}>📈 Score Variation (Std Dev): {scoreDeviation ?? 'N/A'}</Text>
      <Text style={styles.summaryText}>📉 Overall Trend: {overallTrend ?? 'N/A'}</Text>
    </View>

    {/* Line Chart: Display Progression Data for Selected Drills */}
    {Object.keys(progressionData).length > 0 && (
      <LineChart
        data={{
          labels: Object.values(progressionData)[0]?.dates || [],
          datasets: Object.entries(progressionData).map(([drillId, data]) => ({
            data: data.results,
            label: drillId, 
          })),
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix="%"
        chartConfig={{
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientTo: "#FFFFFF",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />
    )}

    {/* Score Distribution Bar Chart */}
    {Object.keys(scoreDistribution).length > 0 && (
      <View>
        <Text style={styles.chartTitle}>📊 Score Distribution</Text>
        <BarChart
          data={{
            labels: Object.keys(scoreDistribution), // Array of labels
            datasets: [{ data: Object.values(scoreDistribution) }] 
          }}
          width={screenWidth - 32}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundGradientFrom: '#f4f4f4',
            backgroundGradientTo: '#f4f4f4',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
          }}
          style={styles.chart}
        />

      </View>
    )}
  </View>
  </ScrollView>
);
}

//Render

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
  },
  summaryContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignItems: 'center'
},
summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginVertical: 2
},
chartTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginVertical: 10,
  color: '#333'
  }
})

