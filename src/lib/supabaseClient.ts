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
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) throw error;
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    return { session, profile };
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