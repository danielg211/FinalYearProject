import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';

interface DrillResult {
  drill_result_id: number;
  GolferID: string;
  drill_id: string;
  LessonID: string | null;
  result: string;
  media_url: string | null;
  created_at: string;
}

export default function ViewDrillResults({ navigation }: any) {
  const [drillResults, setDrillResults] = useState<DrillResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDrillResults = async () => {
      setLoading(true);
      try {
        console.log('Fetching session...');
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data.session;
        const pgaId = session?.user?.id;
        if (!pgaId) throw new Error('User not authenticated');
        console.log('PGA ID:', pgaId);

        console.log('Fetching drill results...');
        const { data: resultsData, error: resultsError } = await supabase
          .from('DrillResults')
          .select('*') // Fetch all fields temporarily
          .eq('PGAID', pgaId)
          .order('created_at', { ascending: false });

        if (resultsError) throw resultsError;

        console.log('Raw drill results data:', resultsData);
        if (resultsData && resultsData.length > 0) {
          setDrillResults(resultsData);
        } else {
          console.log('No drill results found.');
          setDrillResults([]);
        }
      } catch (error: any) {
        console.error('Error fetching drill results:', error.message || error);
        Alert.alert(
          'Error fetching drill results',
          error.message || 'An error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDrillResults();
  }, []);

  const renderDrillResult = ({ item }: { item: DrillResult }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Golfer ID:</Text> {item.GolferID}
      </Text>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Drill ID:</Text> {item.drill_id}
      </Text>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Result:</Text> {item.result}
      </Text>
      <Text style={styles.resultText}>
        <Text style={styles.label}>Uploaded At:</Text>{' '}
        {new Date(item.created_at).toLocaleString()}
      </Text>
      {item.LessonID && (
        <Text style={styles.resultText}>
          <Text style={styles.label}>Lesson ID:</Text> {item.LessonID}
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
