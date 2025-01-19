import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Отсутствуют переменные окружения Supabase. Убедитесь, что VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY установлены в вашем .env файле.'
  );
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
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Ошибка при проверке подключения:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Ошибка при проверке подключения:', error);
    return false;
  }
};

export const restoreSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Ошибка при восстановлении сессии:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Ошибка при восстановлении сессии:', error);
    return null;
  }
};