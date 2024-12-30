import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../colors';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type GolferLoginNavigationProp = StackNavigationProp<RootStackParamList, 'GolferLogin'>;

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function GolferLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<GolferLoginNavigationProp>();

  async function signInWithEmail() {
    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Check if the user exists in the golfers table
      const { data: golferData, error: golferError } = await supabase
        .from('golfers1')
        .select('GolferID')
        .eq('GolferID', signInData.user?.id)
        .single();

      if (golferError) {
        throw new Error("This account doesn't belong to a golfer.");
      }

      Alert.alert('Success', 'Signed in successfully!');
      navigation.navigate('GolferDashboard'); // Redirect to Golfer Dashboard
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[colors.backgroundGrayStart, colors.backgroundGrayEnd]} style={styles.container}>
      <Image source={require('../assets/Logo.png')} style={styles.logo} />

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          labelStyle={styles.labelStyle}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.textGreen }}
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainerStyle}
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor={colors.borderGray}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          labelStyle={styles.labelStyle}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.textGreen }}
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainerStyle}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={colors.borderGray}
          autoCapitalize="none"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          buttonStyle={styles.signInButton}
          onPress={signInWithEmail}
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
  },
  signInButton: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
