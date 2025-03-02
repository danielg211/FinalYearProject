import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { supabase } from '../lib/supabase';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { Session } from '@supabase/supabase-js';


const screenHeight = Dimensions.get('window').height;


// Define the navigation type for MainDashboard
type PGAHomeNavigationProp = StackNavigationProp<RootStackParamList, 'PGAHome'>;

// PGAHome component
export default function PGAHome() {
  const navigation = useNavigation<PGAHomeNavigationProp>();
  const [proName, setProName] = useState<string>('PGA Professional');
  const [clientCount, setClientCount] = useState<number>(0);
  const [lessonsCompleted, setLessonsCompleted] = useState<number>(0);
  const [drillsAssigned, setDrillsAssigned] = useState<number>(0);
  const [proId, setProId] = useState<string | null>(null);
  const [topGolfers, setTopGolfers] = useState<{ name: string; improvement: number }[]>([]);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(sessionData.session);
      }
    };
  
    fetchSession();
  }, []);



useEffect(() => {
  const fetchPGAId = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error) {
      Alert.alert("Error", "Failed to fetch session");
      return;
    }

    const userId = sessionData?.session?.user?.id;

    if (userId) {
      setProId(userId);
    }
  };

  fetchPGAId();
}, []);


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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
       {/* 🔹 Chat Button Moved to Top-Right */}
    <View style={styles.topBar}>
      <Text style={styles.dashboardTitle}>PGA Dashboard</Text>
      <TouchableOpacity 
        style={styles.chatButton} 
        onPress={() => {
          if (!proId) {
            Alert.alert("Error", "PGA Pro ID not found.");
            return;
          }
        
          navigation.navigate("ChatScreen", {
            senderId: proId ?? "",  // ✅ Ensures senderId is never null
            senderType: "pga",
            receiverId: null, 
            receiverType: "golfer",
          });
        }}
        
      >
        <FontAwesome5 name="comments" size={20} color="white" />
      </TouchableOpacity>
    </View>
      
    <ScrollView 
      keyboardShouldPersistTaps="handled" 
      contentContainerStyle={{ paddingBottom: 50 }} // ✅ Ensures scrolling works 
    >
      <View style={styles.header}>
  <FontAwesome5 name="golf-ball" size={28} color="#1E88E5" style={{ marginBottom: 10 }} />
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
  title="Manage Golfers"
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
  title="Lesson History"
  icon={<FontAwesome5 name="book" size={18} color="white" />}
  buttonStyle={styles.primaryButton}
  onPress={() => navigation.navigate('ViewLessonsPGA')}
/>
{/*
<Button
  title="Create Drills"
  icon={<FontAwesome5 name="dumbbell" size={18} color="white" />}
  buttonStyle={styles.primaryButton}
  onPress={() => navigation.navigate('CreateDrills')}
/>
*/}
<Button
  title="Drill Performance"
  icon={<FontAwesome5 name="chart-bar" size={18} color="white" />}
  buttonStyle={styles.primaryButton}
  onPress={() => navigation.navigate('ViewDrillResults')}
/>
<Button
  title="Golfer Progress Insights"
  icon={<FontAwesome5 name="chart-line" size={18} color="white" />}
  buttonStyle={styles.primaryButton}
  onPress={() => navigation.navigate('ProgressionHomePGA')}
/>

<Button
  title="Change Password"
  icon={<FontAwesome5 name="lock-closed" size={18} color="white" />}
  buttonStyle={styles.primaryButton}
  onPress={() => {
    if (!session) {
      Alert.alert("Error", "Session not found.");
      return;
    }
    navigation.navigate('ChangePasswordPGA', { session });
  }}
/>

{/* ✅ Sign Out Button */}
<Button
  title="Log Out"
  icon={<MaterialIcons name="exit-to-app" size={22} color="white" />}
  buttonStyle={[styles.primaryButton, styles.signOutButton]}
  onPress={handleSignOut}
/>

      </View>
    </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  scrollView: {
    paddingBottom: 50,
    alignItems: 'center',
    width: '100%',
  },

  // 📌 Top Bar (Chat Button on Right)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Chat button pushed to the right
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Green PGA branding
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chatButton: {
    backgroundColor: '#1E88E5', // Blue color for chat button
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  topGolfersCard: {
    width: '90%',
    backgroundColor: '#FFF3E0', // Light orange
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  
  // 📌 Header Section
  header: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    width: '90%',
  },

  // 📌 Stats Card (Modern Look)
  metricsCard: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  metricText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  metricValue: {
    fontWeight: 'bold',
    color: '#388E3C',
    fontSize: 16,
  },
    
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50', // Green PGA color
      borderRadius: 10,
      paddingVertical: 14,
         // ✅ Makes all buttons the same width
      maxWidth: 400,  // ✅ Prevents them from being too wide on large screens
      justifyContent: 'center',
      marginVertical: 8, // ✅ Ensures equal spacing between buttons
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  
    // 📌 Special Style for Sign Out Button
    signOutButton: {
      backgroundColor: '#D32F2F',  // Red for logout
    },
});



