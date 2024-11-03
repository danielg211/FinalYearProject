import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
const colors = {
  primaryGreen: '#4CAF50',
  backgroundGrayStart: '#F0F4F8', // Light gray start
  backgroundGrayEnd: '#CFD8DC',   // Slightly darker gray end
  textGreen: '#2E7D32',
  borderGray: '#CCCCCC',
  buttonGray: '#E0E0E0',
};

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  // State variables for managing user input and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
// Function to handle user sign-in with email and password
  async function signInWithEmail() {
    setLoading(true);// Attempt to sign in the user with Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert(error.message); // If an error occurs, show an alert with the error message
    setLoading(false); // Hide loading indicator after processing
  }
// Function to handle user sign-up with email and password
  async function signUpWithEmail() {  // Show loading indicator while processing
    // Attempt to sign up the user with Supabase
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert(error.message);   // Show an alert with the error message if sign-up fails
    if (!session) Alert.alert('Please check your inbox for email verification!'); // If no session is returned, notify user to verify email
    setLoading(false);  // Hide loading indicator after processing
  }

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <Image
        source={require('../assets/Logo.png')}
        style={styles.logo}
      />
      
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          labelStyle={{ color: colors.textGreen, fontSize: 16 }}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.textGreen }}
          inputStyle={{ color: colors.textGreen }}
          inputContainerStyle={{
            backgroundColor: '#FFFFFF', // White background for input
            borderRadius: 8,
            borderColor: colors.borderGray,
            borderWidth: 1,
            paddingHorizontal: 8,
          }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor={colors.borderGray}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          labelStyle={{ color: colors.textGreen, fontSize: 16 }}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.textGreen }}
          inputStyle={{ color: colors.textGreen }}
          inputContainerStyle={{
            backgroundColor: '#FFFFFF', // White background for input
            borderRadius: 8,
            borderColor: colors.borderGray,
            borderWidth: 1,
            paddingHorizontal: 8,
          }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor={colors.borderGray}
          autoCapitalize="none"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          buttonStyle={{
            backgroundColor: colors.primaryGreen,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          buttonStyle={{
            backgroundColor: colors.buttonGray,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
          titleStyle={{ color: colors.textGreen }}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  mt20: {
    marginTop: 20,
  },
});
