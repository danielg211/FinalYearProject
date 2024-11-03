import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StyleSheet, View, Alert, ScrollView, Text } from 'react-native';
import { Button, Input } from '@rneui/themed';
import Avatar from './Avatar';
import { RadioButton } from 'react-native-paper'; //https://callstack.github.io/react-native-paper/docs/components/RadioButton/
import { useNavigation, useRoute } from '@react-navigation/native'; //https://reactnavigation.org/docs/use-route
import { StackNavigationProp } from '@react-navigation/stack'; //https://reactnavigation.org/docs/native-stack-navigator
import { Session } from '@supabase/supabase-js';
import { RootStackParamList } from '../App'; // Import the correct route param list

// Define types for route parameters and navigation prop
type RouteParams = {
  session: Session;
};

type AccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Account'>;

export default function Account() {
  // Initialize navigation and route hooks
  const navigation = useNavigation<AccountScreenNavigationProp>();
  const route = useRoute();

   // Destructure session from route params with type assertion
  const { session } = route.params as RouteParams;

  // State variables for managing loading status, user data, and avatar URL
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

    // useEffect to fetch profile data when the component mounts or session changes
  useEffect(() => {
    if (session) getProfile(); // Call getProfile only if session exists
  }, [session]);

  // Function to fetch user profile information from Supabase
  async function getProfile() {
    try {
      setLoading(true); // Set loading state to true while fetching data
      if (!session?.user) throw new Error('No user on the session!');

       // Fetch user data based on session user ID
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, role, avatar_url`)
        .eq('id', session?.user.id)
        .single();

         // Handle potential errors, except when status is 406 (no results)
      if (error && status !== 406) { 
        throw error;
      }

       // Update state with fetched profile data
      if (data) {
        setUsername(data.username);
        setRole(data.role);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message); // Show error alert if fetch fails
      }
    } finally {
      setLoading(false);  // Set loading state to false after fetching data
    }
  }

    // Function to update user profile information in Supabase
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
      setLoading(true);  // Set loading state to true while updating data
      if (!session?.user) throw new Error('No user on the session!'); // Throw error if session is invalid

       // Define updated data object with user ID and timestamp
      const updates = {
        id: session?.user.id,
        username,
        role,
        avatar_url,
        updated_at: new Date(),
      };
       // Upsert (insert or update) the user profile in Supabase
      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;  // Throw error if update fails
      }
       // Navigate to specific dashboard based on user's role
      if (role === 'PGAProfessional') {
        navigation.navigate('PGADashboard');
      } else if (role === 'Golfer') {
        navigation.navigate('GolferDashboard');
      }
    } catch (error) {   // Show error alert if update fails
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);  // Set loading state to false after updating data
    }
  }
  // Main component UI rendering
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, role, avatar_url: url });
          }}
        />

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={session?.user?.email} disabled />
        </View>
        <View style={styles.verticallySpaced}>
          <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
        </View>

        <View style={styles.verticallySpaced}>
          <Text>Select Role:</Text>
          <RadioButton.Group onValueChange={newRole => setRole(newRole)} value={role}>
            <RadioButton.Item label="PGA Professional" value="PGAProfessional" />
            <RadioButton.Item label="Golfer" value="Golfer" />
          </RadioButton.Group>
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? 'Loading ...' : 'Update'}
            onPress={() => updateProfile({ username, role, avatar_url: avatarUrl })}
            disabled={loading}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        </View>
      </View>
    </ScrollView>
  );
}
// Styles for layout and spacing
const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,  // Ensures the scrollable content grows correctly
    paddingBottom: 20,
  },
  container: {
    padding: 12,
    flex: 1,
    justifyContent: 'center', // Adjust based on your design needs
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
