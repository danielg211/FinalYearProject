import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

type Lesson = {
  Lessonid: string;
  created_at: string;
  feedback: string;
  drills: string[]; // Array of drill names
  area: string;
};

export default function ViewLessonsGolfer({ navigation }: { navigation: any }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const golferId = session?.user.id;

        if (!golferId) {
          throw new Error('User not authenticated');
        }

        // Fetch lessons and associated drill names
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('Lesson1')
          .select('Lessonid, created_at, feedback,area, drills:AssignedDrills(drill_id)')
          .eq('GolferID', golferId)
          .order('created_at', { ascending: false });

        if (lessonsError) throw lessonsError;

        // Map lessons to include drill names
        const mappedLessons = await Promise.all(
          lessonsData.map(async (lesson: any) => {
            const drillIds = lesson.drills.map((d: any) => d.drill_id);

            const { data: drillNames, error: drillError } = await supabase
              .from('drills')
              .select('name')
              .in('drill_id', drillIds);

            if (drillError) throw drillError;

            return {
              ...lesson,
              drills: drillNames.map((d: any) => d.name), // Extract drill names
            };
          })
        );

        setLessons(mappedLessons as Lesson[]);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={styles.lessonCard}>
      <View style={styles.header}>
        <Text style={styles.area}>{item.area}</Text> {/* Add area here */}
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.feedback}>Feedback: {item.feedback}</Text>
      <Text style={styles.drills}>
        Drills Assigned: {item.drills.length > 0 ? item.drills.join(', ') : 'None'}
      </Text>
      <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate('LessonDetailsGolfer', { lessonId: item.Lessonid })}
    >
      <Text style={styles.buttonText}>View Full Lesson</Text>
    </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ViewDrill', { lessonId: item.Lessonid })}
      >
        <Text style={styles.buttonText}>View Drills</Text>
      </TouchableOpacity>
    </View>
  );
  

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading lessons...</Text>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item, index) => `${item.Lessonid}-${index}`}
          renderItem={renderLesson}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  listContainer: {
    paddingBottom: 16,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align area and date on opposite ends
    marginBottom: 8,
  },
  area: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  feedback: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  drills: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
