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
});

export const checkSupabaseConnection = async () => {
  try {
    console.log("Проверка подключения к Supabase...");
    const start = Date.now();
    
    const { data, error } = await Promise.race([
      supabase.from('profiles').select('id').limit(1).maybeSingle(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ]);
      
    const duration = Date.now() - start;
    console.log(`Время ответа Supabase: ${duration}ms`);

    if (error) {
      console.error('Ошибка подключения к Supabase:', error);
      return false;
    }
    
    console.log("Подключение к Supabase успешно");
    return true;
  } catch (error) {
    console.error('Ошибка при проверке подключения к Supabase:', error);
    return false;
  }
};