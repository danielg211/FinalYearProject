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

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';

// Define route param list for navigation
export type RootStackParamList = {
  Homescreen: undefined;
  PGALogin: undefined;
  GolferLogin: undefined;
  GolferDashboard: undefined;
  PGADashboard: undefined;
  PGAHome: undefined;
  PGAAccount: {session: Session }; 
  GolferAccount: {session: Session }; 
  ViewLessonsPGA: undefined;
  LogLesson: undefined;
  CreateDrills: undefined;
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          // Start at the Homescreen where the user selects login
          <>
            <Stack.Screen name="Homescreen" component={Homescreen} />
            <Stack.Screen name="PGALogin" component={PGALogin} />
            <Stack.Screen name="GolferLogin" component={GolferLogin} />
          </>
        ) : (
          // Authenticated users go to their respective account and dashboards
          <>
            <Stack.Screen name="PGAAccount" component={PGAAccount} initialParams={{ session }} />
            <Stack.Screen name="GolferAccount" component={GolferAccount} initialParams={{ session }} />
            <Stack.Screen name="GolferDashboard" component={GolferDashboard} />
            <Stack.Screen name="PGADashboard" component={PGADashboard} />
            <Stack.Screen name="PGAHome" component={PGAHome} />
            
            <Stack.Screen name="ViewLessonsPGA" component={ViewLessonsPGA} />
            <Stack.Screen name="LogLesson" component={LogLesson} />
            <Stack.Screen name="CreateDrills" component={CreateDrills} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
