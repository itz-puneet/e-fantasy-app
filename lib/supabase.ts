// ============================================================================
//  lib/supabase.ts
//  This is the single connection between your app and your Supabase backend.
//  Every screen imports "supabase" from here to read/write data.
// ============================================================================
import 'react-native-url-polyfill/auto'; // required for Supabase on React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// These come from your .env file (must start with EXPO_PUBLIC_).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // A friendly reminder if you forgot to fill in .env
  console.warn(
    '[E-Fantasy] Supabase keys are missing. Open the .env file and add your ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Save the login session on the phone so users stay logged in.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // not needed for a mobile app
  },
});
