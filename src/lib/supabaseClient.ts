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
    detectSessionInUrl: true
  }
});

export const checkSupabaseConnection = async () => {
  try {
    console.log("Проверка подключения к Supabase...");
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Ошибка проверки соединения:', error);
      return false;
    }

    if (data === null) {
      console.log('Подключение успешно, но таблица пуста');
      return true;
    }

    console.log('Подключение к Supabase успешно установлено');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка при проверке подключения к Supabase:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Неизвестная ошибка при проверке подключения к Supabase:', error);
    }
    return false;
  }
};