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
    storage: localStorage
  }
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Проверка подключения к Supabase...');
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