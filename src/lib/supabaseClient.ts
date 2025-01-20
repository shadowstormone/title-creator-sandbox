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
  const TIMEOUT = 15000; // Увеличиваем таймаут до 15 секунд

  try {
    // Сначала проверяем локальное хранилище
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (!storedSession) {
      console.log('Сессия не найдена в локальном хранилище');
      return null;
    }

    // Создаем промис для таймаута
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Превышено время ожидания при восстановлении сессии'));
      }, TIMEOUT);
    });

    // Получаем сессию с сервера
    const sessionPromise = supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        throw error;
      }
      return session;
    });

    // Используем Promise.race с обработкой ошибок
    const session = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]).catch(error => {
      console.error('Ошибка при восстановлении сессии:', error);
      // Очищаем локальное хранилище при ошибке
      localStorage.removeItem('supabase.auth.token');
      return null;
    });

    const elapsedTime = Date.now() - startTime;
    if (session) {
      console.log(`Сессия успешно восстановлена за ${elapsedTime}ms`);
    } else {
      console.log(`Сессия не восстановлена (${elapsedTime}ms)`);
    }

    return session;
  } catch (error) {
    console.error('Критическая ошибка при восстановлении сессии:', error);
    // Очищаем локальное хранилище при критической ошибке
    localStorage.removeItem('supabase.auth.token');
    return null;
  }
};