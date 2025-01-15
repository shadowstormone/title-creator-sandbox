import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable',
    },
  },
  db: {
    schema: 'public'
  },
});

type QueryResult = {
  data: any;
  error: any;
};

export const checkSupabaseConnection = async () => {
  try {
    console.log("Проверка подключения к Supabase...");
    const start = Date.now();
    
    // Увеличиваем таймаут до 10 секунд
    const result = await Promise.race([
      supabase.from('ip_sessions').select('count').single(),
      new Promise<QueryResult>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
    ]) as QueryResult;

    const duration = Date.now() - start;
    console.log(`Время ответа Supabase: ${duration}ms`);

    if (result.error) {
      console.error('Ошибка подключения к Supabase:', result.error);
      return false;
    }
    
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