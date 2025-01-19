import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Homescreen from './components/Homescreen';
import PGALogin from './components/PGALogin';
import GolferLogin from './components/GolferLogin';
import PGAAccount from './components/PGAAccount';
import GolferAccount from './components/GolferAccount';
import GolferDashboard from './components/GolferDashboard';
import PGADashboard from './components/PGADashboard';
import PGAHome from './components/PGAHome';
import ViewLessonsPGA from './components/ViewLessonsPGA';
import LogLesson from './components/LogLesson';
import CreateDrills from './components/CreateDrills';
import ViewLessonsGolfer from './components/ViewLessonsGolfer';
import LessonDetailsGolfer from './components/LessonDetailsGolfer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';
import UploadDrillResult from './components/UploadDrillResult';
import ViewDrillResults from './components/ViewDrillResults';
import ChangePasswordGolfer from './components/ChangePasswordGolfer';

// Define route param list for navigation
export type RootStackParamList = {
  Homescreen: undefined;
  PGALogin: undefined;
  GolferLogin: undefined;
  GolferDashboard: undefined;
  ViewLessonsGolfer: undefined;
  LessonDetailsGolfer: { lessonId: string };
  PGADashboard: undefined;
  PGAHome: undefined;
  PGAAccount: {session: Session }; 
  GolferAccount: {session: Session }; 
  ViewLessonsPGA: undefined;
  LogLesson: undefined;
  CreateDrills: undefined;
  UploadDrillResult: undefined;
  ViewDrillResults: undefined;
  ChangePasswordGolfer: {session: Session }; 
};

// Create the Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);

      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Optional: Add a loading spinner or splash screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: true, // Enable headers globally
          headerStyle: { backgroundColor: '#4CAF50' }, // Header background color
          headerTintColor: '#FFF', // Back button and title color
          headerTitleStyle: { fontWeight: 'bold' }, // Title font style
         }}>
        {!session ? (
          // Start at the Homescreen where the user selects login
          <>
            <Stack.Screen name="Homescreen" component={Homescreen} options={{ title: 'Welcome' }} />
            <Stack.Screen name="PGALogin" component={PGALogin} options={{ title: 'PGA Login' }} />
            <Stack.Screen name="GolferLogin" component={GolferLogin} options={{ title: 'Golfer Login' }} />
          </>
        ) : (
          // Authenticated users go to their respective account and dashboards
          <>
            <Stack.Screen name="PGAAccount" component={PGAAccount} initialParams={{ session }} />
            <Stack.Screen name="GolferAccount" component={GolferAccount} initialParams={{ session }} />
            <Stack.Screen name="ChangePasswordGolfer" component={ChangePasswordGolfer} initialParams={{ session }} />

            <Stack.Screen name="GolferDashboard" component={GolferDashboard} options={{ title: 'Golfer Dashboard' }} />
            <Stack.Screen name="ViewLessonsGolfer" component={ViewLessonsGolfer}  options={{ title: 'Your Lessons' }}/>
            <Stack.Screen name="LessonDetailsGolfer" component={LessonDetailsGolfer} options={{ title: 'Lesson Details' }} />
            <Stack.Screen name="UploadDrillResult" component={UploadDrillResult} options={{ title: 'Upload Drill Result' }} />
           
            <Stack.Screen name="PGADashboard" component={PGADashboard} />
            <Stack.Screen name="PGAHome" component={PGAHome} options={{ title: 'PGA Dashboard', headerLeft: () => null }}/>
            
            <Stack.Screen name="ViewLessonsPGA" component={ViewLessonsPGA} options={{ title: 'View Lessons' }}/>
            <Stack.Screen name="LogLesson" component={LogLesson} options={{ title: 'Log Lesson' }}/>
            <Stack.Screen name="CreateDrills" component={CreateDrills} options={{ title: 'Create Drills' }}/>
            <Stack.Screen name="ViewDrillResults" component={ViewDrillResults} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}