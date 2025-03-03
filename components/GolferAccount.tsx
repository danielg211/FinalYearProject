import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import Avatar from './Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { colors } from '../colors';
import { RootStackParamList } from '../App';

// Navigation and Route types
type NavigationProp = StackNavigationProp<RootStackParamList, 'GolferAccount'>;
type RouteProps = RouteProp<RootStackParamList, 'GolferAccount'>;

// Component Props
interface Props {
  route: RouteProps;
  navigation: NavigationProp;
}

export default function GolferAccount({ route }: Props) {
  const { session } = route.params;
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  //const [email, setEmail] = useState('');
  const [handicap, setHandicap] = useState('');
 // const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch Golfer Profile
  useEffect(() => {
    if (session) fetchGolferProfile();
  }, [session]);

  async function fetchGolferProfile() {
    try {
      setLoading(true);
      console.log("Fetching golfer profile...");
      const { data, error } = await supabase
        .from('golfers1')
        .select('name, handicap')
        .eq('GolferID', session.user.id)
        .single();

      if (error) throw error;

      console.log("Golfer profile data:", data);

      setName(data.name || '');
      //setEmail(data.email || '');
     // setHandicap(data.handicap || '');
     setHandicap(data.handicap?.toString() || '');

      //setAvatarUrl(data.avatar_url || '');
    } catch (error) {
      console.error("Error fetching golfer profile:", error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }

  function validateHandicap(value: string) {
    // Remove non-numeric characters except "-" at the start
    let sanitizedValue = value.replace(/[^0-9-]/g, '');

    // Ensure negative sign only at the beginning
    if (sanitizedValue.includes('-') && sanitizedValue.indexOf('-') !== 0) {
      sanitizedValue = sanitizedValue.replace('-', '');
    }

    setHandicap(sanitizedValue);
  }

  // Update Golfer Profile
  async function updateProfile() {
    try {
      setLoading(true);
       // Convert handicap to number
       const numericHandicap = parseInt(handicap, 10);

       // Validate handicap range
       if (isNaN(numericHandicap) || numericHandicap < -5 || numericHandicap > 54) {
         Alert.alert('Invalid Handicap', 'Handicap must be a number between -5 and 54.');
         setLoading(false);
         return;
       }

      const updates = {
        GolferID: session.user.id,
        name,
       // handicap,
        handicap: numericHandicap,
      //  email,
       // avatar_url: avatarUrl,
      };

      console.log("Updating profile with:", updates);

      const { error } = await supabase.from('golfers1').upsert(updates);

      if (error) throw error;

      console.log("Profile updated successfully");
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.navigate('GolferDashboard'); // Navigate to Golfer Dashboard
    } catch (error) {
      console.error("Error updating golfer profile:", error);

      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        

        {/* Name Input */}
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          labelStyle={styles.label}
          inputStyle={styles.input}
        />

        {/* Email Display 
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          labelStyle={styles.label}
          inputStyle={styles.input}
        />*/}

        {/* Handicap Input */}
        <Input
          label="Handicap"
          value={handicap}
          onChangeText={validateHandicap}
          keyboardType="numeric"
          labelStyle={styles.label}
          inputStyle={styles.input}
        />

        {/* Update Profile Button */}
        <Button
          title={loading ? 'Updating...' : 'Update Profile'}
          onPress={updateProfile}
          buttonStyle={styles.button}
          disabled={loading}
        />

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={() => supabase.auth.signOut()}
          buttonStyle={[styles.button, styles.signOutButton]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5",  },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  label: { color: colors.textGreen, fontSize: 16 },
  input: { color: '#333333' },
  button: {
    backgroundColor: colors.primaryGreen,
    marginVertical: 10,
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: '#d9534f', // Red for sign out button
  },
});
