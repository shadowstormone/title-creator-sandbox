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
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
  db: {
    schema: 'public'
  }
});

const CONNECTION_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds

export const checkSupabaseConnection = async () => {
  let retryCount = 0;

  const attemptConnection = async (): Promise<boolean> => {
    try {
      console.log(`Попытка подключения к Supabase... (попытка ${retryCount + 1}/${MAX_RETRIES})`);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), CONNECTION_TIMEOUT);
      });

      const queryPromise = supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (result.error) {
        throw result.error;
      }

      console.log('Подключение к Supabase успешно установлено');
      return true;
    } catch (error) {
      console.error('Ошибка при проверке подключения к Supabase:', error);
      
      if (retryCount < MAX_RETRIES - 1) {
        retryCount++;
        console.log(`Повторная попытка через ${RETRY_DELAY/1000} секунд...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return attemptConnection();
      }
      
      console.error('Превышено максимальное количество попыток подключения');
      return false;
    }
  };

  return attemptConnection();
};