import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
});

export const checkSupabaseConnection = async () => {
  try {
    console.log("Проверка подключения к Supabase...");
    
    const { error } = await supabase.from('ip_sessions').select('*').limit(1);

    if (error) {
      console.error('Ошибка проверки соединения:', error);
      return false;
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

// Создаем типы для базы данных
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          email: string | null;
          role: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      ip_sessions: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string;
          created_at: string;
          last_activity: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ip_address: string;
          created_at?: string;
          last_activity?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ip_address?: string;
          created_at?: string;
          last_activity?: string;
        };
      };
    };
  };
};