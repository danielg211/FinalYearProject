import React, { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { colors } from '../colors';
import { RootStackParamList } from '../App';





// Supabase Password Documentation https://supabase.com/docs/guides/auth/passwords           

// Navigation and Route types
type NavigationProp = StackNavigationProp<RootStackParamList, 'ChangePasswordPGA'>;
type RouteProps = RouteProp<RootStackParamList, 'ChangePasswordPGA'>;

// Component Props
interface Props {
  route: RouteProps;
  navigation: NavigationProp;
}

export default function ChangePasswordPGA({ route }: Props) {
  

  const navigation = useNavigation<NavigationProp>();

  const { session } = route.params ?? {};
    if (!session) {
      Alert.alert("Error", "Session data is missing.");
      navigation.goBack();
    }

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      console.log('Password mismatch error');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching session...');

      // Fetch the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error('Failed to fetch session.');

      console.log('Session fetched successfully.');

      const userEmail = session?.user?.email;

      if (!userEmail) {
        throw new Error('User email not available.');
      }

      console.log(`User email: ${userEmail}`);

      // Reauthenticate the user
      console.log('Reauthenticating user...');
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (reauthError) {
        console.error('Reauthentication error:', reauthError.message);
        throw new Error('Current password is incorrect.');
      }

      console.log('Reauthentication successful.');

      // Update the password
      console.log('Updating password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Password update error:', updateError.message);
        throw new Error('Failed to update password.');
      }

      console.log('Password updated successfully.');
      Alert.alert('Success', 'Password updated successfully!');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          labelStyle={styles.label}
          inputStyle={styles.input}
        />

        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          labelStyle={styles.label}
          inputStyle={styles.input}
        />

        <Input
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          labelStyle={styles.label}
          inputStyle={styles.input}
        />

        <Button
          title={loading ? 'Updating...' : 'Change Password'}
          onPress={handleChangePassword}
          buttonStyle={styles.button}
          disabled={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", 
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    color: colors.textGreen,
    fontSize: 16,
  },
  input: {
    color: '#333333',
  },
  button: {
    backgroundColor: colors.primaryGreen,
    marginVertical: 10,
    borderRadius: 8,
  },
});
