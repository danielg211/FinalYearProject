import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

// Explicitly define navigation type
type ProgressionHomeGolferNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProgressionHomeGolfer() {
  const navigation = useNavigation<ProgressionHomeGolferNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progression & Insights</Text>
      <Text style={styles.subtitle}>Track your performance trends</Text>

      {/* Button to View General Progression */}
      <Button
        title="📊 View Progression Data"
        buttonStyle={styles.button}
        onPress={() => navigation.navigate('ViewProgressionGolfer')}
      />

      {/* Button to View Lesson-to-Improvement Ratio 
      <Button
        title="📈 Lesson Improvement Analysis"
        buttonStyle={styles.button}
        onPress={() => navigation.navigate('LessonImprovementPGA')}
      />
      */}
      <Button
        title="📈 PGA Tour Benchmark"
        buttonStyle={styles.button}
        onPress={() => navigation.navigate('ViewPGABenchmarksComparisonGolfer')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F6F8',
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
    width: '80%',
    marginVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
});
