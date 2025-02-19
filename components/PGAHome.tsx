import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';


// Define the navigation type for MainDashboard
type PGAHomeNavigationProp = StackNavigationProp<RootStackParamList, 'PGAHome'>;

// PGAHome component
export default function PGAHome() {
  const navigation = useNavigation<PGAHomeNavigationProp>();
  const [proName, setProName] = useState<string>('PGA Professional');
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

  
    async function handleSignOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
  
        navigation.reset({
          index: 0,
          routes: [{ name: 'Homescreen' }],
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to sign out.');
      }
    }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* Header Section */}
        <Text style={styles.title}>Welcome, {proName}</Text>
        <Text style={styles.subtitle}>Manage your lessons, drills, and clients</Text>

        {/* Metrics Section */}
        <View style={styles.metricsCard}>
          <Text style={styles.metricText}>👥 Clients Managed: <Text style={styles.metricValue}>{clientCount}</Text></Text>
          <Text style={styles.metricText}>🏌️‍♂️ Lessons Completed: <Text style={styles.metricValue}>{lessonsCompleted}</Text></Text>
          <Text style={styles.metricText}>📊 Drills Assigned: <Text style={styles.metricValue}>{drillsAssigned}</Text></Text>
        </View>

        {/* Action Buttons */}
        <Button
          title="Golfer Management"
          icon={<FontAwesome5 name="user-friends" size={18} color="white" />}
          buttonStyle={styles.primaryButton}
          onPress={() => navigation.navigate('PGADashboard')}
        />
        <Button
          title="Log a Lesson"
          icon={<MaterialIcons name="playlist-add" size={22} color="white" />}
          buttonStyle={styles.primaryButton}
          onPress={() => navigation.navigate('LogLesson')}
        />
        <Button
          title="View Lessons"
          icon={<FontAwesome5 name="book" size={18} color="white" />}
          buttonStyle={styles.primaryButton}
          onPress={() => navigation.navigate('ViewLessonsPGA')}
        />
        <Button
          title="Create Drills"
          icon={<FontAwesome5 name="dumbbell" size={18} color="white" />}
          buttonStyle={styles.primaryButton}
          onPress={() => navigation.navigate('CreateDrills')}
        />
        <Button
          title="View Drill Results"
          icon={<FontAwesome5 name="chart-bar" size={18} color="white" />}
          buttonStyle={styles.primaryButton}
          onPress={() => navigation.navigate('ViewDrillResults')}
        />
        <Button
          title="View Progression"
          icon={<FontAwesome5 name="chart-line" size={18} color="white" />}
          buttonStyle={styles.primaryButton}
          onPress={() => navigation.navigate('ProgressionHomePGA')}
        />
        <Button
          title="Sign Out"
          icon={<MaterialIcons name="exit-to-app" size={22} color="white" />}
          buttonStyle={[styles.primaryButton, styles.signOutButton]}
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  );
}

// ✅ Modernized Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsCard: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    alignItems: 'center',
  },
  metricText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  metricValue: {
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '90%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  signOutButton: {
      
    },
});

