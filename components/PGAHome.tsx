import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';

// Define the navigation type for MainDashboard
type PGAHomeNavigationProp = StackNavigationProp<RootStackParamList, 'PGAHome'>;

// PGAHome component
export default function PGAHome() {
  const navigation = useNavigation<PGAHomeNavigationProp>();
  const [proName, setProName] = useState<string>('');
  const [clientCount, setClientCount] = useState<number>(0);
  const [lessonsCompleted, setLessonsCompleted] = useState<number>(0);
  const [drillsAssigned, setDrillsAssigned] = useState<number>(0);

  // Fetch PGA Pro data and metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch the logged-in PGA Pro's session
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const proId = sessionData?.session?.user?.id;

        if (!proId) {
          throw new Error('Unable to fetch logged-in PGA Pro details.');
        }

        // Fetch the PGA Pro's name
        const { data: proData, error: proError } = await supabase
          .from('PGAProfessional')
          .select('name')
          .eq('PGAID', proId)
          .single();

        if (proError) throw proError;
        setProName(proData?.name || 'PGA Professional');

        // Fetch number of golfers managed
        const { data: golfersData, error: golfersError } = await supabase
          .from('golfers1')
          .select('*')
          .eq('PGAID', proId);

        if (golfersError) throw golfersError;
        setClientCount(golfersData.length);

        // Fetch total drills assigned
        const { data: drillsData, error: drillsError } = await supabase
          .from('AssignedDrills')
          .select('*')
          .eq('PGAID', proId);

        if (drillsError) throw drillsError;
        setDrillsAssigned(drillsData.length);

        // Fetch lessons completed (count of Lessonid)
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('Lesson1')
          .select('Lessonid', { count: 'exact' }) // Use 'exact' to get the count
          .eq('PGAID', proId);

        if (lessonsError) throw lessonsError;
        setLessonsCompleted(lessonsData.length || 0); // Set the count of Lessonid
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred.');
      }
    };

    fetchMetrics();
  }, []);

  return (
  <ScrollView keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      {/* Header Section */}
      <Text style={styles.title}>Welcome, {proName}</Text>
      <Text style={styles.subtitle}>Choose a section to get started</Text>

      {/* Metrics Section */}
      <View style={styles.metricsContainer}>
        <Text style={styles.metric}>Clients Managed: {clientCount}</Text>
        <Text style={styles.metric}>Lessons Completed: {lessonsCompleted}</Text>
        <Text style={styles.metric}>Drills Assigned: {drillsAssigned}</Text>
      </View>

      {/* Action Buttons */}
      <Button
        title="Golfer Management"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('PGADashboard')}
      />
      <Button
        title="Log a Lesson"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('LogLesson')}
        containerStyle={styles.buttonContainer}
      />
      <Button
        title="View Lessons"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('ViewLessonsPGA')}
        containerStyle={styles.buttonContainer}
      />
      <Button
        title="Create Drills"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('CreateDrills')}
        containerStyle={styles.buttonContainer}
      />
      <Button
        title="View Drill Results"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('ViewDrillResults')}
        containerStyle={styles.buttonContainer}
      />
      <Button
        title="View Progression"
        buttonStyle={styles.primaryButton}
        onPress={() => navigation.navigate('ViewProgressionPGA')}
        containerStyle={styles.buttonContainer}
      />
    </View>
  </ScrollView>
  );
}

// Styles for the PGAHome component Chatgpt
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metric: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 15,
    paddingVertical: 10,
    width: '80%',
  },
  buttonContainer: {
    marginTop: 15,
  },
});

