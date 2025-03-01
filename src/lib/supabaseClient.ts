
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  }
});

// Базовая проверка подключения к базе данных
export const checkDatabaseConnection = async () => {
  try {
    // Try to access animes table instead, since profiles might not exist yet
    const { data, error } = await supabase
      .from('animes')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection error (animes):', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Инициализация сессии
export const initializeSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!session) {
      console.log('No active session found');
      return null;
    }

    // Try to get profile data, but don't fail if profiles table doesn't exist yet
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileError) {
        return { session, profile };
      } else {
        console.log('Could not fetch profile, returning session only:', profileError);
        return { session, profile: null };
      }
    } catch (profileError) {
      console.log('Error fetching profile, returning session only:', profileError);
      return { session, profile: null };
    }
  } catch (error) {
    console.error('Session initialization error:', error);
    return null;
  }
};

// Очистка сессии
export const clearSession = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};
