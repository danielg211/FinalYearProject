import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';

export default function GolferDashboard({ navigation }: { navigation: any }) {
  const [golferName, setGolferName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGolferProfile();
  }, []);

  async function fetchGolferProfile() {
    setLoading(true);
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
        .select('name')
        .eq('GolferID', session.user.id) // Use session.user.id to match the user
        .single();
  
      if (fetchError) throw fetchError;
  
      setGolferName(data?.name || 'Golfer');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch golfer profile.');
    } finally {
      setLoading(false);
    }
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
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {golferName}!</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="View Lesson History"
          buttonStyle={styles.button}
          onPress={() => navigation.navigate('ViewLessonsGolfer')}
        />
        <Button
          title="Update Profile"
          buttonStyle={styles.button}
          onPress={() => navigation.navigate('GolferAccount')}
        />
        <Button
          title="Upload Drill Result"
          buttonStyle={styles.button}
          onPress={() => navigation.navigate('UploadDrillResult')}
        />
        <Button
          title="Change Password"
          buttonStyle={styles.button}
          onPress={() => navigation.navigate('ChangePasswordGolfer')}
        />
        <Button
          title="Sign Out"
          buttonStyle={[styles.button, styles.signOutButton]}
          onPress={handleSignOut}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textGreen,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    marginVertical: 10,
    backgroundColor: colors.primaryGreen,
    borderRadius: 10,
  },
  signOutButton: {
    backgroundColor: colors.deleteRed,
  },
});

