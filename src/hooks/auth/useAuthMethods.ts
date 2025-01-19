import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from './useAuthSession';
import { useProfileManagement } from './useProfileManagement';
import { trackIpSession } from './useIpSession';

export const useAuthMethods = () => {
  const { setLoading, setError, reset, setInitialized } = useAuthStore();
  const { toast } = useToast();
  const { validateSession, handleSessionError } = useAuthSession();
  const { loadUserProfile, updateProfile } = useProfileManagement();

  const login = async (email: string, password: string): Promise<void> => {
    console.log("Attempting login for email:", email);
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
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
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error("Не удалось получить данные пользователя");
      }

      await trackIpSession(data.user.id);
      await loadUserProfile(data.user.id);
      setInitialized(true);

      toast({
        title: "Успешно",
        description: "Вы успешно вошли в систему",
      });
    } catch (error) {
      handleSessionError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { username, role: "user" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Не удалось создать пользователя");
      }

      toast({
        title: "Успешно",
        description: "Проверьте вашу почту для подтверждения регистрации",
      });
    } catch (error) {
      handleSessionError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
    } catch (error) {
      handleSessionError(error as Error);
      throw error;
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