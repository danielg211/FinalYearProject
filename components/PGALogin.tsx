import React, { useState } from 'react';
import { StyleSheet, View, Alert, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PGALogin'>;

// Import for background gradient effects
// ChatGPT recommended using LinearGradient from Expo to enhance UI design with gradient backgrounds.


// References:
// Auth Screen Implementation with Supabase and React Native
// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx
// Adapted with UI design.

export default function PGALogin() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); 

  // Function to handle sign-up
  async function signUpWithEmail() {
    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      //Insert into PGAProfessional table
      if (userId) {
        const { error: insertError } = await supabase
          .from('PGAProfessional')
          .insert([{ PGAID: userId, name, email }]);

        if (insertError) throw insertError;

        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('PGAHome'); 
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  // Function to handle sign-in
  async function signInWithEmail() {
    setLoading(true);

    try {
      //  Authenticate the user
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = data.user?.id;

      //  Verify the user exists in PGAProfessional table
      const { data: pgaData, error: pgaError } = await supabase
        .from('PGAProfessional')
        .select('*')
        .eq('PGAID', userId)
        .single();

      if (pgaError || !pgaData) {
        throw new Error('Account does not exist as a PGA Professional.');
      }

      // Step 3: Redirect to PGADashboard
      Alert.alert('Success', 'Signed in successfully!');
      navigation.navigate('PGAHome');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
     

      {/* Conditional name input for sign-up */}
      {isSignUp && (
        <Input
          placeholder="Name"
          onChangeText={setName}
          value={name}
          autoCapitalize="words"
        />
      )}

      <Input placeholder="Email" onChangeText={setEmail} value={email} autoCapitalize="none" />
      <Input
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {/* Sign Up or Sign In Button */}
      <Button
        title={
          loading
            ? isSignUp
              ? 'Signing Up...'
              : 'Signing In...'
            : isSignUp
            ? 'Sign Up'
            : 'Sign In'
        }
        onPress={isSignUp ? signUpWithEmail : signInWithEmail}
        disabled={loading || !email || !password || (isSignUp && !name)}
        buttonStyle={styles.button}
      />

      {/* Toggle between Sign Up and Sign In */}
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
// Styles for layout and design elements
//https://reactnative.dev/docs/style
// ChatGPT was used to optimize the styling approach, including adjustments to shadow properties and layout alignments for UI consistency.
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
  toggleText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#007f00',
    fontWeight: '500',
  },
});
