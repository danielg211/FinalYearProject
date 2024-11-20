//import './gesture-handler';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Account from './components/Account';
import GolferDashboard from './components/GolferDashboard';
import PGADashboard from './components/PGADashboard'; 
import PGAHome from './components/PGAHome';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';
import ViewLessonsPGA from './components/ViewLessonsPGA';
import LogLesson from './components/LogLesson';
import CreateDrills from './components/CreateDrills';

// App.tsx Screen Implementation with Supabase and React Native
// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx

//To enable navigation between pages code was adapted from this https://reactnative.dev/docs/navigation

// Define the route param list type for navigation
export type RootStackParamList = {
  Account: { session: Session };
  GolferDashboard: undefined;
  PGADashboard: undefined;
  Auth: undefined;  
  LogLesson: undefined;
  PGAHome: undefined;
  ViewLessonsPGA: undefined;
  CreateDrills: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

 
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session); 
      setSession(session);
    });
  
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session); 
      setSession(session);
    });
  
    
  }, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={!session ? "Auth" : "Account"}>
        {!session ? (  
          <Stack.Screen name="Auth" component={Auth} />
        ) : (
          <>
           <Stack.Screen
            name="Account"
            component={Account}
            initialParams={{ session: session || undefined }}  
          />

            <Stack.Screen name="PGAHome" component= {PGAHome} />
            <Stack.Screen name="GolferDashboard" component={GolferDashboard} />
            <Stack.Screen name="PGADashboard" component={PGADashboard} />
            <Stack.Screen name="ViewLessonsPGA" component={ViewLessonsPGA} />
            <Stack.Screen name="LogLesson" component={LogLesson} />
            <Stack.Screen name="CreateDrills" component={CreateDrills} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}