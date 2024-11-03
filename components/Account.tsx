import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, ScrollView, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import Avatar from './Avatar';
import { RadioButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';
import { RootStackParamList } from '../App';
import { LinearGradient } from 'expo-linear-gradient';

const colors = {
  primaryGreen: '#4CAF50',
  backgroundGrayStart: '#F0F4F8',
  backgroundGrayEnd: '#CFD8DC',
  textGreen: '#2E7D32',
  borderGray: '#CCCCCC',
  buttonGray: '#E0E0E0',
};

// Define types for route parameters and navigation prop
type RouteParams = {
  session: Session;
};

type AccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Account'>;

export default function Account() {
  const navigation = useNavigation<AccountScreenNavigationProp>();
  const route = useRoute();
  const { session } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, role, avatar_url`)
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) throw error;

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

      const updates = {
        id: session?.user.id,
        username,
        role,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

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
              labelStyle={{ color: colors.textGreen, fontSize: 16 }} // Green label color
              inputStyle={{ color: colors.textGreen }} // Green text color
              inputContainerStyle={{
                backgroundColor: '#FFFFFF', // White background
                borderRadius: 8,
                borderColor: colors.borderGray,
                borderWidth: 1,
                paddingHorizontal: 8,
              }}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Input
              label="Username"
              value={username || ''}
              onChangeText={(text) => setUsername(text)}
              labelStyle={{ color: colors.textGreen, fontSize: 16 }} // Green label color
              inputStyle={{ color: colors.textGreen }} // Green text color
              inputContainerStyle={{
                backgroundColor: '#FFFFFF', // White background
                borderRadius: 8,
                borderColor: colors.borderGray,
                borderWidth: 1,
                paddingHorizontal: 8,
              }}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Text style={{ color: colors.textGreen, fontSize: 16 }}>Select Role:</Text>
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
              buttonStyle={{
                backgroundColor: colors.primaryGreen,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Button
              title="Sign Out"
              onPress={() => supabase.auth.signOut()}
              buttonStyle={{
                backgroundColor: colors.buttonGray,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
              titleStyle={{ color: colors.textGreen }}
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Styles for layout and spacing
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
});
