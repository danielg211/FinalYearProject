import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

// Explicitly define navigation type
type ProgressionHomePGANavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProgressionHomePGA() {
  const navigation = useNavigation<ProgressionHomePGANavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Progression & Insights</Text>
        <Text style={styles.subtitle}>Track golfer performance trends</Text>
  
        {/* Button to View General Progression */}
        <Button
          title="📊 View Progression Data"
          buttonStyle={styles.button}
          onPress={() => navigation.navigate('ViewProgressionPGA')}
        />
  
        {/* Button to View PGA Tour Benchmark */}
        <Button
          title="📈 PGA Tour Benchmark"
          buttonStyle={styles.button}
          onPress={() => navigation.navigate('ViewPgaBenchmarksComparison')}
        />
      </View>
    </View>
  );
  
}
  const styles = StyleSheet.create({
    container: {
      flex: 1, 
      justifyContent: 'center', // ✅ Centers everything vertically
      alignItems: 'center', // ✅ Centers everything horizontally
      padding: 20,
      backgroundColor: '#F4F6F8',
    },
    content: {
      width: '100%',  // ✅ Ensures the content area is well-sized
      alignItems: 'center', // ✅ Centers the text & buttons horizontally
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: '#2E7D32',
      marginBottom: 20,
      textAlign: 'center',
    },
    button: {
      width: '80%', // ✅ Ensures button width is appropriate
      marginVertical: 10, // ✅ Adds spacing between buttons
      backgroundColor: '#4CAF50',
      borderRadius: 8,
    },
  });

