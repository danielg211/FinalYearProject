import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Alert, FlatList,} from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';

// Cooper Codes "Supabase Database Course - Fetch, Create, Modify, Delete Data (React / Supabase CRUD Tutorial)." YouTube,
// https://www.youtube.com/watch?v=4yVSwHO5QHU 

// React Native Tutorial 10 - FlatList https://www.youtube.com/watch?v=TTvWoTKbZ3Y&list=PLS1QulWo1RIb_tyiPyOghZu_xSiCkB1h4&index=10 by Programming Knowledge

// React Native Docs Display Image https://reactnative.dev/docs/image

interface DrillResult {
  drill_result_id: number;
  GolferID: string;
  drill_id: string;
  result: string;
  media_url: string | null;
  created_at: string;
  golferName: string;
  drillName: string;
  Lesson1: { area: string };
}

export default function ViewDrillResults({ navigation }: any) {
  const [drillResults, setDrillResults] = useState<DrillResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDrillResults = async () => {
      setLoading(true);
      try {
        console.log('Fetching session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const pgaId = sessionData?.session?.user?.id;
        if (!pgaId) {
          throw new Error('User not authenticated');
        }
        console.log('PGA ID:', pgaId);

        const { data: resultsData, error: resultsError } = await supabase
          .from('DrillResults')
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
      } catch (error: any) {
        console.error('Error fetching drill results:', error.message || error);
        Alert.alert('Error fetching drill results', error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDrillResults();
  }, []);

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
      {item.media_url && (
        <Text style={styles.resultText}>
          <Text style={styles.label}>Media URL:</Text> {item.media_url}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Drill Results</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : drillResults.length > 0 ? (
        <FlatList
          data={drillResults}
          keyExtractor={(item) => item.drill_result_id.toString()}
          renderItem={renderDrillResult}
        />
      ) : (
        <Text style={styles.noDataText}>
          No drill results available. Please check again later.
        </Text>
      )}
      <Button
        title="Back to Dashboard"
        onPress={() => navigation.navigate('PGADashboard')}
        buttonStyle={styles.backButton}
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  resultCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#D32F2F',
    marginTop: 20,
  },
});
