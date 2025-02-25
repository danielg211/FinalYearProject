import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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
          title="Chat with Coach"
          icon={<Ionicons name="chatbubbles-outline" size={20} color="white" />}
          buttonStyle={styles.primaryButton}
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
              senderId: golferId,  // ✅ Now using golferId state
              senderType: "golfer",
              receiverId: pgaProId, // ✅ Assigned PGA Pro ID
              receiverType: "pga",
            });
          }}
        />
        <Button
          title="Sign Out"
          icon={<MaterialIcons name="exit-to-app" size={22} color="white" />}
          buttonStyle={[styles.primaryButton, styles.signOutButton]}
          onPress={handleSignOut}
        />
      </View>
    </View>
  );
}

// ✅ Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  welcomeCard: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textGreen,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGreen,
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
  signOutButton: {
    backgroundColor: colors.deleteRed,
  },
});
