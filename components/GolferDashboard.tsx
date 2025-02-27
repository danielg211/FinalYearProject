import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../colors';

export default function GolferDashboard({ navigation }: { navigation: any }) {
  const [golferName, setGolferName] = useState<string>('Golfer');
  const [loading, setLoading] = useState(true);
  const [golferId, setGolferId] = useState<string | null>(null);
  const [pgaProId, setPgaProId] = useState<string | null>(null);



  useEffect(() => {
    fetchGolferProfile();
    fetchAssignedPGAPro();
  }, []);

  async function fetchAssignedPGAPro() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
  
      if (error || !session) {
        throw new Error("Unable to fetch session or user is not authenticated");
      }
  
      const { data, error: fetchError } = await supabase
        .from('golfers1')
        .select('PGAID')
        .eq('GolferID', session.user.id)
        .single();
  
      if (fetchError) throw fetchError;
  
      setPgaProId(data?.PGAID || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch assigned PGA Professional.');
    }
  }
  async function fetchGolferProfile() {
    setLoading(true);
    console.log("🔄 Fetching golfer profile...");

    try {
      // ✅ Fetch session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("🔍 Session response:", sessionData);

      if (sessionError || !sessionData?.session?.user?.id) {
        throw new Error("❌ No session found or user is not authenticated.");
      }

      const userId = sessionData.session.user.id;
      console.log("✅ Logged-in golfer ID:", userId);

      setGolferId(userId);

      // ✅ Fetch golfer details from 'golfers1'
      const { data, error: fetchError } = await supabase
        .from("golfers1")
        .select("name, PGAID")
        .eq("GolferID", userId)
        .single();

      console.log("📊 Golfer data from DB:", data);

      if (fetchError) throw fetchError;

      setGolferName(data?.name || "Golfer");
      setPgaProId(data?.PGAID || null);
    } catch (error) {
      console.error("❌ Error fetching golfer profile:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to fetch golfer profile.");
    } finally {
      console.log("✅ Setting loading to false.");
      setLoading(false);
    }
  }

  // ✅ Debug log for loading state
  if (loading) {
    console.log("⏳ GolferDashboard is still loading...");
    return (
      <View style={styles.container}>
        <Text>Loading golfer profile...</Text>
      </View>
    );
  }


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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* 🔹 Chat Button Moved to Top-Right */}
      <View style={styles.topBar}>
        <Text style={styles.dashboardTitle}>Golfer Dashboard</Text>
        <TouchableOpacity 
          style={styles.chatButton} 
          onPress={() => {
            if (!golferId) {
              Alert.alert("Error", "Golfer ID not found.");
              return;
            }
            if (!pgaProId) {
              Alert.alert("Error", "No assigned PGA Professional found.");
              return;
            }
  
            navigation.navigate("ChatScreen", {
              senderId: golferId, 
              senderType: "golfer",
              receiverId: pgaProId, 
              receiverType: "pga",
            });
          }}
        >
          <FontAwesome5 name="comments" size={20} color="white" />
        </TouchableOpacity>
      </View>
  
      <ScrollView>
        <View style={styles.container}>
          {/* Welcome Section */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>Welcome, {golferName}! 🏌️‍♂️</Text>
            <Text style={styles.subText}>Manage your lessons and track your progress</Text>
          </View>
  
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="View Lesson History"
              icon={<FontAwesome5 name="book-open" size={18} color="white" />}
              buttonStyle={styles.primaryButton}
              onPress={() => navigation.navigate('ViewLessonsGolfer')}
            />
            <Button
              title="Update Profile"
              icon={<MaterialIcons name="person" size={22} color="white" />}
              buttonStyle={styles.primaryButton}
              onPress={() => navigation.navigate('GolferAccount')}
            />
            <Button
              title="Upload Drill Result"
              icon={<FontAwesome5 name="upload" size={18} color="white" />}
              buttonStyle={styles.primaryButton}
              onPress={() => navigation.navigate('UploadDrillResult')}
            />
            <Button
              title="Change Password"
              icon={<Ionicons name="lock-closed" size={20} color="white" />}
              buttonStyle={styles.primaryButton}
              onPress={() => navigation.navigate('ChangePasswordGolfer')}
            />
            <Button
              title="View Progression"
              icon={<FontAwesome5 name="chart-line" size={18} color="white" />}
              buttonStyle={styles.primaryButton}
              onPress={() => navigation.navigate('ViewProgressionGolfer')}
            />
            <Button
              title="See How You Compare against the Pros"
              icon={<FontAwesome5 name="chart-line" size={18} color="white" />}
              buttonStyle={styles.primaryButton}
              onPress={() => navigation.navigate('ViewPGABenchmarksComparisonGolfer')}
            />
            <Button
              title="Sign Out"
              icon={<MaterialIcons name="exit-to-app" size={22} color="white" />}
              buttonStyle={[styles.primaryButton, styles.signOutButton]}
              onPress={handleSignOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  // 📌 Top Bar (Moves Chat Button to Right)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // ✅ Ensures chat button is on the right
    alignItems: 'center',
    backgroundColor: '#4CAF50', // ✅ PGA Green
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
    backgroundColor: '#1E88E5', // ✅ Blue color for chat button
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

  welcomeCard: {
    width: '95%', 
    backgroundColor: '#FFFFFF', 
    padding: 20,
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, 
    marginBottom: 20,
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32', 
    textAlign: 'center',
    width: '100%',
  },
  subText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50', 
    borderRadius: 10,
    paddingVertical: 14,
    width: '80%',  
    maxWidth: 400,  
    justifyContent: 'center',
    marginVertical: 8, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButton: {
    backgroundColor: '#D32F2F',
  },
});


