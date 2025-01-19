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
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable'
    }
  }
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Проверка подключения к Supabase...');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Активная сессия найдена:', session.user.id);
    } else {
      console.log('Активная сессия не найдена');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Ошибка при проверке подключения:', error);
      return false;
    }

    console.log('Подключение к Supabase успешно');
    return true;
  } catch (error) {
    console.error('Ошибка при проверке подключения:', error);
    return false;
  }
};

export const restoreSession = async () => {
  try {
    console.log('Попытка восстановления сессии...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Ошибка при восстановлении сессии:', error);
      return null;
    }

    if (!session) {
      console.log('Активная сессия не найдена');
      return null;
    }

    console.log('Сессия успешно восстановлена:', session.user.id);
    return session;
  } catch (error) {
    console.error('Ошибка при восстановлении сессии:', error);
    return null;
  }
};