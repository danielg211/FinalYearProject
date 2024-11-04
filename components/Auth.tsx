import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';  //https://docs.expo.dev/versions/latest/sdk/linear-gradient/

//References
// Auth Screen Implementation with Supabase and React Native
// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx
// Adapted with UI design.


// Define color constants for the app theme. Colors taken from https://htmlcolorcodes.com/color-names/
const colors = {
  primaryGreen: '#4CAF50',
  backgroundGrayStart: '#F0F4F8', // Light gray start for gradient background
  backgroundGrayEnd: '#CFD8DC',   // Slightly darker gray end for gradient background
  textGreen: '#2E7D32',
  borderGray: '#CCCCCC',
  buttonGray: '#E0E0E0',
};

// Set up event listener to refresh Supabase session automatically
// when the app is in the foreground and stop when it goes to the background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh(); // Refresh session in the foreground
  } else {
    supabase.auth.stopAutoRefresh();  // Stop refreshing in the background
  }
});

export default function Auth() {
  // State variables to store email, password, and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle user sign-in with email and password
  async function signInWithEmail() {
    setLoading(true); // Show loading indicator while processing
    const { error } = await supabase.auth.signInWithPassword({ email, password }); // Attempt to sign in the user with Supabase
    if (error) Alert.alert(error.message); // Show an alert if there's an error
    setLoading(false); // Hide loading indicator after processing
  }

  // Function to handle user sign-up with email and password
  async function signUpWithEmail() {
    setLoading(true); // Show loading indicator while processing
    const { data: { session }, error } = await supabase.auth.signUp({ email, password }); // Attempt to sign up the user with Supabase
    if (error) Alert.alert(error.message); // Show an alert if there's an error
    if (!session) Alert.alert('Please check your inbox for email verification!'); // Notify the user to verify email if no session is returned
    setLoading(false); // Hide loading indicator after processing
  }

  return (
    // LinearGradient component for background color gradient
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <Image
        source={require('../assets/Logo.png')} // App logo image
        style={styles.logo}
      />

      {/* Email input field */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          labelStyle={{ color: colors.textGreen, fontSize: 16 }}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.textGreen }}
          inputStyle={{ color: colors.textGreen }}
          inputContainerStyle={{
            backgroundColor: '#FFFFFF',
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

      {/* Password input field */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          labelStyle={{ color: colors.textGreen, fontSize: 16 }}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.textGreen }}
          inputStyle={{ color: colors.textGreen }}
          inputContainerStyle={{
            backgroundColor: '#FFFFFF',
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

      {/* Sign-in button */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading} // Disable button while loading
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

      {/* Sign-up button */}
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading} // Disable button while loading
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

// Styles for layout and design elements
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
