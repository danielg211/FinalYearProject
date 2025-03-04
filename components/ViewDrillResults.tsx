import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DrillResult {
  drill_result_id: number;
  GolferID: string;
  drill_id: string;
  result: number;
  media_url: string | null;
  created_at: string;
  golferName: string;
  drillName: string;
  Lesson1: { area: string };
}
interface Golfer {
  id: string;
  name: string;
}



export default function ViewDrillResults({ navigation }: any) {
  const [drillResults, setDrillResults] = useState<DrillResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<DrillResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGolfer, setSelectedGolfer] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [golfers, setGolfers] = useState<Golfer[]>([]);

  useEffect(() => {
    fetchDrillResults();
    fetchGolfers();
  }, []);

  useEffect(() => {
    if (drillResults.length > 0) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD

      const filtered = drillResults.filter(
        (result) =>
          (!selectedGolfer || result.golferName === selectedGolfer) &&
          result.created_at.startsWith(formattedDate)
      );

      setFilteredResults(filtered);
    }
  }, [selectedGolfer, selectedDate, drillResults]);

  const fetchDrillResults = async () => {
    setLoading(true);
    try {
      console.log('Fetching session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const pgaId = sessionData?.session?.user?.id;
      if (!pgaId) throw new Error('User not authenticated');
      console.log('PGA ID:', pgaId);

      const { data: resultsData, error: resultsError } = await supabase
        .from('DrillResults1')
        .select(`
          drill_result_id,
          result,
          created_at,
          media_url,
          Lesson1(area),
          golfers1(name), 
          drills(name)    
        `)
        .eq('PGAID', pgaId)
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      console.log('Raw drill results data:', resultsData);

      const mappedResults = resultsData.map((result: any) => ({
        ...result,
        golferName: result.golfers1.name,
        drillName: result.drills.name,
      }));

      setDrillResults(mappedResults);
      setFilteredResults(mappedResults);
    } catch (error: any) {
      console.error('Error fetching drill results:', error.message || error);
      Alert.alert('Error fetching drill results', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchGolfers = async () => {
    const { data, error } = await supabase.from('golfers1').select('GolferID, name');
    if (error) {
      console.error('Error fetching golfers:', error);
    } else {
      if (data) {
      setGolfers(data.map((golfer: any) => ({ id: golfer.GolferID, name: golfer.name })));
      }

    }
  };

  const filterResultsByDate = (days: number) => {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - days); // Subtract days
  
    const filtered = drillResults.filter((result) => {
      const resultDate = new Date(result.created_at);
      return resultDate >= pastDate;
    });
  
    setFilteredResults(filtered);
  };
  


  const filterResults = () => {
    const formattedDate = selectedDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD
    const filtered = drillResults.filter(
      (result) =>
        (!selectedGolfer || result.golferName === selectedGolfer) &&
        result.created_at.startsWith(formattedDate)
    );
    setFilteredResults(filtered);
  };

  const renderDrillResult = ({ item }: { item: DrillResult }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Golfer Name:</Text> {item.golferName}
      </Text>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Drill Name:</Text> {item.drillName}
      </Text>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Result:</Text> {item.result}
      </Text>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Uploaded At:</Text> {new Date(item.created_at).toLocaleString()}
      </Text>
      {item.Lesson1 && (
        <Text style={styles.resultText}>
          <Text style={styles.label}>Lesson Area:</Text> {item.Lesson1.area}
        </Text>
      )}
      {/*
      {item.media_url && (item.media_url.endsWith('.jpg') || item.media_url.endsWith('.png')) && (
        <Image source={{ uri: item.media_url }} style={styles.image} />
      )}
      {!item.media_url && <Text>Unsupported Media Type</Text>}
      */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginVertical: 10 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Drill Results</Text>

      {/* Golfer Picker */}
      <Text style={styles.label}>Filter by Golfer</Text>
      <RNPickerSelect
        onValueChange={(value) => setSelectedGolfer(value)}
        items={golfers.map((golfer) => ({ label: golfer.name, value: golfer.name }))}
        placeholder={{ label: "Select a Golfer...", value: null }}
        style={pickerSelectStyles}
      />
      
      {/* Date Picker */}
      <Text style={styles.label}>Filter by Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event: any, date?: Date | undefined) => {
          setShowDatePicker(false);
          if (date) setSelectedDate(date);
        }}

        />
      )}
      {/* Filter Buttons for Last 7 Days & Last Month */}
        <View style={styles.buttonContainer}>
          <Button title="Last 7 Days" onPress={() => filterResultsByDate(7)} buttonStyle={styles.filterButton} />
          <Button title="Last Month" onPress={() => filterResultsByDate(30)} buttonStyle={styles.filterButton} />
        </View>

      {/*<Button title="Apply Filters" onPress={filterResults} buttonStyle={styles.button} />*/}

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : filteredResults.length > 0 ? (
        <FlatList data={filteredResults} keyExtractor={(item) => item.drill_result_id.toString()} renderItem={renderDrillResult} />
      ) : (
        <Text style={styles.noDataText}>No drill results available.</Text>
      )}

      {/* <Button title="Back to Dashboard" onPress={() => navigation.navigate('PGADashboard')} buttonStyle={styles.backButton} />*/}
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
  },
});




const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20, textAlign: 'center' },
  loadingText: { textAlign: 'center', fontSize: 16, color: '#666' },
  noDataText: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 20 },
  label: {
    fontWeight: 'bold',
    fontSize: 16, // Make it slightly larger
    color: '#333', // Darker text for better readability
    marginBottom: 3, // Adds breathing space
  },
  datePickerButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center', // Ensure text is centered
    marginBottom: 12,
    width: '90%', // Ensure consistent width
    alignSelf: 'center', // Center align it
  },
  dateText: { fontSize: 16 },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, marginBottom: 15 },
  backButton: { backgroundColor: '#D32F2F', marginTop: 20 },
  resultCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // Round the corners
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginBottom: 12, // Space between cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android shadow effect
  },
  resultText: {
    fontSize: 15,
    color: '#555', // Softer black
    marginBottom: 5,
  },
  image: { width: 200, height: 150, marginTop: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CCCCCC' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10, // Adds spacing
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 8, // Reduce height slightly
    paddingHorizontal: 15, // Add padding for better spacing
    minWidth: 120, // Consistent width
    alignItems: 'center',
  },
});


