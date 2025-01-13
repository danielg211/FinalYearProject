import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

type Lesson = {
  Lessonid: string;
  created_at: string;
  feedback: string;
  drills: string[];
  area: string;
};

export default function ViewLessonsGolfer() {
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

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('Lesson1')
          .select('Lessonid, created_at, feedback, area, drills:AssignedDrills(drill_id)')
          .eq('GolferID', golferId)
          .order('created_at', { ascending: false });

        if (lessonsError) throw lessonsError;

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
              drills: drillNames.map((d: any) => d.name),
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

  // PDF Generation
  const generatePDF = (lesson: Lesson) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lesson Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(lesson.created_at).toLocaleDateString()}`, 10, 20);
    doc.text(`Feedback: ${lesson.feedback}`, 10, 30, { maxWidth: 180 });
    doc.text(`Drills: ${lesson.drills.length > 0 ? lesson.drills.join(', ') : 'None'}`, 10, 40);
    doc.text(`Area: ${lesson.area}`, 10, 50);

    doc.save(`Lesson_${lesson.Lessonid}.pdf`);
  };

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.area}>Area: {item.area}</Text>
      <Text style={styles.date}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
      <Text style={styles.feedback}>Feedback: {item.feedback}</Text>
      <Text style={styles.drills}>
        Drills: {item.drills.length > 0 ? item.drills.join(', ') : 'None'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => generatePDF(item)}
      >
        <Text style={styles.buttonText}>Download PDF</Text>
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
          keyExtractor={(item) => item.Lessonid}
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
