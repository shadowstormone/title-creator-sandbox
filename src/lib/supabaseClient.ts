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
    const { data: health } = await supabase.rpc('check_health');
    return health === true;
  } catch (error) {
    console.error('Ошибка проверки подключения:', error);
    return false;
  }
};

export const restoreSession = async () => {
  const startTime = Date.now();
  const TIMEOUT = 8000; // 8 секунд максимум на восстановление сессии

  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Превышено время ожидания при восстановлении сессии'));
      }, TIMEOUT);
    });

    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: any } };
    
    const elapsedTime = Date.now() - startTime;
    console.log(`Сессия восстановлена за ${elapsedTime}ms`);
    
    return session;
  } catch (error) {
    console.error('Ошибка при восстановлении сессии:', error);
    return null;
  }
};