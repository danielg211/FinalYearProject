
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// This code references concepts and patterns demonstrated in Supabase's tutorial 
// on React Native Database & User Authentication available on their YouTube channel.
// Supabase. "React Native Database & User Authentication." YouTube, https://www.youtube.com/watch?v=AE7dKIKMJy4&list=PL5S4mPUpp4OsrbRTx21k34aACOgpqQGlx

const supabaseUrl = "https://ofcigefxrxegypqslgyq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY2lnZWZ4cnhlZ3lwcXNsZ3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNzA2MjQsImV4cCI6MjA0NDg0NjYyNH0.odP4JSuh5whH0XWVJjOKGVXD8ZqYOjJqoQTyWGy6iGs";
const supabaseAdminKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY2lnZWZ4cnhlZ3lwcXNsZ3lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTI3MDYyNCwiZXhwIjoyMDQ0ODQ2NjI0fQ.HC_DevCTz4MSjU5ed2-FiqvMaMyZ4fdKV2Jq2AZJ8zk";

// Admin client with service_role key
//https://supabase.com/docs/reference/javascript/auth-admin-getuserbyid

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})