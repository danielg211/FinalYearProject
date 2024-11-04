//import './gesture-handler';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Account from './components/Account';
import GolferDashboard from './components/GolferDashboard';
import PGADashboard from './components/PGADashboard'; // This assumes PGADashboard.tsx exists in the components folder.
import LogLesson from './components/LogLesson';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Session } from '@supabase/supabase-js';

// Define the route param list type for navigation
export type RootStackParamList = {
  Account: { session: Session };
  GolferDashboard: undefined;
  PGADashboard: undefined;
  Auth: undefined;  // Add the Auth screen here
  LogLesson: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

 /* useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);
  */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session); // Add this to check session on app load
      setSession(session);
    });
  
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session); // Add this to track session changes
      setSession(session);
    });
  
    
  }, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={!session ? "Auth" : "Account"}>
        {!session ? (  // Correctly handle null by checking !session
          <Stack.Screen name="Auth" component={Auth} />
        ) : (
          <>
           <Stack.Screen
            name="Account"
            component={Account}
            initialParams={{ session: session || undefined }}  // Convert null to undefined
          />

            
            <Stack.Screen name="GolferDashboard" component={GolferDashboard} />
            <Stack.Screen name="PGADashboard" component={PGADashboard} />
            <Stack.Screen name="LogLesson" component={LogLesson} />

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

