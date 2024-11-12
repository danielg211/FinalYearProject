import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, ScrollView, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import Avatar from './Avatar';
import { RadioButton } from 'react-native-paper'; //https://www.geeksforgeeks.org/how-to-implement-radio-button-in-react-native/
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';
import { RootStackParamList } from '../App';
// Import for background gradient effects
// ChatGPT recommended using LinearGradient from Expo to enhance UI design with gradient backgrounds.
// ChatGPT prompt: "How to optimize background in React Native using Expo?"
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors'; // Import shared colors

// Auth Screen Implementation with Supabase and React Native
// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx
// Adapted with UI design.
// adapted to include radio buttons which let user go to next page.
// also adapted fields to suit my data types what was was website now is user role


// Define types for route parameters and navigation prop
type RouteParams = {
  session: Session;
};

type AccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Account'>;

// Main component for Account settings
export default function Account() {
  const navigation = useNavigation<AccountScreenNavigationProp>();
  const route = useRoute();
  const { session } = route.params as RouteParams;  // Retrieve session from route params

  // State variables for managing profile data and loading status
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch profile data when the component mounts or session changes
  useEffect(() => {
    if (session) getProfile(); // Ensure there's a valid session user before proceeding
  }, [session]);

  // Function to retrieve the user's profile from Supabase
  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!'); // Ensure there's a valid session user before proceeding
      // Query Supabase to retrieve profile details
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, role, avatar_url`)
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) throw error; // Handle errors (except status 406 for no data)

       // Set profile data if available
      if (data) {
        setUsername(data.username);
        setRole(data.role);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Function to update the user's profile in Supabase
  async function updateProfile({
    username,
    role,
    avatar_url,
  }: {
    username: string;
    role: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');
      // Prepare the profile data to be upserted (inserted or updated)
      const updates = {
        id: session?.user.id,
        username,
        role,
        avatar_url,
        updated_at: new Date(),
      };

       // Send the updates to Supabase, handling any errors
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      // Navigate to different dashboards based on the user's role
      if (role === 'PGAProfessional') {
        navigation.navigate('PGADashboard');
      } else if (role === 'Golfer') {
        navigation.navigate('GolferDashboard');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.innerContainer}>
          <Avatar
            size={200}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateProfile({ username, role, avatar_url: url });
            }}
          />

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="Email"
              value={session?.user?.email}
              disabled
              labelStyle={styles.labelStyle}
              inputStyle={styles.inputStyle}
              inputContainerStyle={styles.inputContainerStyle}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Input
              label="Username"
              value={username || ''}
              onChangeText={(text) => setUsername(text)}
              labelStyle={styles.labelStyle}
              inputStyle={styles.inputStyle}
              inputContainerStyle={styles.inputContainerStyle}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Text style={styles.roleLabel}>Select Role:</Text>
            <RadioButton.Group onValueChange={(newRole) => setRole(newRole)} value={role}>
              <RadioButton.Item label="PGA Professional" value="PGAProfessional" />
              <RadioButton.Item label="Golfer" value="Golfer" />
            </RadioButton.Group>
          </View>

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title={loading ? 'Loading ...' : 'Update'}
              onPress={() => updateProfile({ username, role, avatar_url: avatarUrl })}
              disabled={loading}
              buttonStyle={styles.updateButton}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Button
              title="Sign Out"
              onPress={() => supabase.auth.signOut()}
              buttonStyle={styles.signOutButton}
              titleStyle={styles.signOutTitle}
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Styles for layout and design elements
// https://reactnative.dev/docs/style
// This was done for account, auth and Pga dashboard
// ChatGPT was used to optimize the styling approach, including color choices, layout alignments, and button shadows.
// ChatGPT prompts: "Optimize React Native styling for containers and buttons", "Create consistent styling for labels and input fields in React Native".

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  innerContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    // ChatGPT suggested optimizations for input container styles,
    // including padding, borderRadius, and borderWidth to enhance UI consistency.
  },
  roleLabel: {
    color: colors.textGreen,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // ChatGPT was used to suggest shadow settings to improve button aesthetics
  },
  signOutButton: {
    backgroundColor: colors.buttonGray,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
     // ChatGPT recommended this styling to provide visual consistency across buttons.
  },
  signOutTitle: {
    color: colors.textGreen,
  },
});
