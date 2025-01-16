import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const checkSupabaseConnection = async () => {
  try {
    console.log("Checking Supabase connection...");
    
    const { error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
      console.error('Connection check error:', error);
      return false;
    }

    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error checking Supabase connection:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error checking Supabase connection:', error);
    }
    return false;
  }
};