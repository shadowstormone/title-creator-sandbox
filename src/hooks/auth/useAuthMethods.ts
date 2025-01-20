import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from './useAuthSession';
import { useProfileManagement } from './useProfileManagement';

export const useAuthMethods = () => {
  const { setLoading, setError, reset, setInitialized } = useAuthStore();
  const { toast } = useToast();
  const { loadUserProfile, updateProfile } = useProfileManagement();

  const login = async (email: string, password: string): Promise<void> => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);
      console.log('Начало процесса входа...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Ошибка входа:', error);
        let errorMessage = "Ошибка входа";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Неверный email или пароль";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email не подтвержден. Проверьте вашу почту";
        }
        toast({
          title: "Ошибка",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }

      if (!data.user) {
        console.error('Нет данных пользователя после входа');
        throw new Error("Не удалось получить данные пользователя");
      }

      console.log('Успешный вход, загрузка профиля...');
      await loadUserProfile(data.user.id);
      
      const elapsedTime = Date.now() - startTime;
      console.log(`Вход выполнен за ${elapsedTime}ms`);
      
      setInitialized(true);
      toast({
        title: "Успешно",
        description: "Вы успешно вошли в систему",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Начало процесса регистрации...');

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { username, role: "user" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Ошибка регистрации:', error);
        throw error;
      }

      console.log('Регистрация успешна');
      toast({
        title: "Успешно",
        description: "Проверьте вашу почту для подтверждения регистрации",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Начало процесса выхода...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log('Выход успешен');
      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
    } finally {
      reset();
      setLoading(false);
    }
  };

  return {
    loadUserProfile,
    login,
    register,
    logout,
    updateProfile,
  };
};