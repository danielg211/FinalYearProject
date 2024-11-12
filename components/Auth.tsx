import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
// Import for background gradient effects
// ChatGPT recommended using LinearGradient from Expo to enhance UI design with gradient backgrounds.
// ChatGPT prompt: "How to optimize background in React Native using Expo?"
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors'; // Import shared colors

// References:
// Auth Screen Implementation with Supabase and React Native
// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx
// Adapted with UI design.

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
          labelStyle={styles.labelStyle}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.textGreen }}
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainerStyle}
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
          labelStyle={styles.labelStyle}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.textGreen }}
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainerStyle}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry
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
          buttonStyle={styles.signInButton}
          onPress={() => signInWithEmail()}
        />
      </View>

      {/* Sign-up button */}
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading} // Disable button while loading
          buttonStyle={styles.signUpButton}
          titleStyle={styles.signUpTitle}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </LinearGradient>
  );
}

// Styles for layout and design elements
//https://reactnative.dev/docs/style
// ChatGPT was used to optimize the styling approach, including adjustments to shadow properties and layout alignments for UI consistency.
// ChatGPT prompts: "Optimize React Native styling for button shadows and container layouts", "Create consistent styling for labels and input fields in React Native".
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
    // ChatGPT recommended shadow settings to enhance the logo's appearance, adding depth for a more polished UI.
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
  labelStyle: {
    color: colors.textGreen,
    fontSize: 16,
  },
  inputStyle: {
    color: colors.textGreen,
  },
  inputContainerStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: colors.borderGray,
    borderWidth: 1,
    paddingHorizontal: 8,
     // ChatGPT suggested optimizations for input container styling, including border radius and padding to enhance usability and consistency.
  },
  signInButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // ChatGPT was used to refine button shadow properties, enhancing button depth and making it visually consistent with the app's design.
  },
  signUpButton: {
    backgroundColor: colors.buttonGray,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
     // ChatGPT provided recommendations for shadow settings to maintain consistency across all buttons.
  },
  signUpTitle: {
    color: colors.textGreen,
  },
});
