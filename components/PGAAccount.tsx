import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { colors } from '../colors';
import { RootStackParamList } from '../App';

// Navigation and Route types
type NavigationProp = StackNavigationProp<RootStackParamList, 'PGAAccount'>;
type RouteProps = RouteProp<RootStackParamList, 'PGAAccount'>;

// Component Props
interface Props {
  route: RouteProps;
  navigation: NavigationProp;
}

export default function PGAAccount({ route }: Props) {
  const { session } = route.params;
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Fetch PGA Professional Profile
  useEffect(() => {
    if (session) fetchPGAProfile();
  }, [session]);

  async function fetchPGAProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('PGAProfessional')
        .select('name, email')
        .eq('PGAID', session.user.id)
        .single();

      if (error) throw error;

      setName(data.name || '');
      setEmail(data.email || '');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }

  // Update PGA Professional Profile
  async function updateProfile() {
    try {
      setLoading(true);
      const updates = {
        PGAID: session.user.id,
        name,
      };

      const { error } = await supabase.from('PGAProfessional').upsert(updates);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.navigate('PGAHome'); // Navigate to PGA Dashboard
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Name Input */}
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          labelStyle={styles.label}
          inputStyle={styles.input}
        />

        {/* Email Display */}
        <Input
          label="Email"
          value={email}
          disabled
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
