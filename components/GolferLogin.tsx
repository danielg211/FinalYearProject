import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Image, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

// Import for background gradient effects
// ChatGPT recommended using LinearGradient from Expo to enhance UI design with gradient backgrounds.


// References:
// Auth Screen Implementation with Supabase and React Native
// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx
// Adapted with UI design.

// Set up event listener to refresh Supabase session automatically
// when the app is in the foreground and stop when it goes to the background.

type GolferLoginNavigationProp = StackNavigationProp<RootStackParamList, 'GolferLogin'>;

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function GolferLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<GolferLoginNavigationProp>();

  async function signInWithEmail() {
    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Check if the user exists in the golfers table
      const { data: golferData, error: golferError } = await supabase
        .from('golfers1')
        .select('GolferID')
        .eq('GolferID', signInData.user?.id)
        .single();

      if (golferError) {
        throw new Error("This account doesn't belong to a golfer.");
      }

      Alert.alert('Success', 'Signed in successfully!');
      navigation.navigate('GolferDashboard'); // Redirect to Golfer Dashboard
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Golfer Login</Text>

      <Input
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {/* Sign In Button */}
      <Button
        title={loading ? 'Signing In...' : 'Sign In'}
        onPress={signInWithEmail}
        disabled={loading || !email || !password}
        buttonStyle={styles.button}
      />
    </View>
  );
}

// Styles (Matching PGA Login)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007f00',
  },
});
