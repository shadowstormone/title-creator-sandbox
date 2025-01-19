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
    console.log('Проверка подключения к Supabase...');
    
    // Сначала проверяем наличие сохраненной сессии
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Ошибка при получении сессии:', sessionError);
      return false;
    }

    console.log('Статус сессии:', session ? 'Активна' : 'Отсутствует');

    // Даже если сессия отсутствует, проверяем подключение к базе
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Ошибка подключения к Supabase:', error.message);
      return false;
    }

    console.log('Подключение к Supabase успешно установлено');
    return true;
  } catch (error) {
    console.error('Критическая ошибка при подключении к Supabase:', error);
    return false;
  }
};

// Функция для восстановления сессии
export const restoreSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Ошибка при восстановлении сессии:', error);
      return null;
    }

    if (session) {
      // Обновляем токен если сессия существует
      await supabase.auth.setSession(session);
      console.log('Сессия успешно восстановлена');
      return session;
    }

    console.log('Нет сохраненной сессии для восстановления');
    return null;
  } catch (error) {
    console.error('Ошибка при попытке восстановления сессии:', error);
    return null;
  }
};