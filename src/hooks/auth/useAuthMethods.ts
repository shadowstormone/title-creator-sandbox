import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useToast } from '@/hooks/use-toast';

export const useAuthMethods = () => {
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<void> => {
    try {
      useAuthStore.getState().setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error("Не удалось получить данные пользователя");
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        await supabase.auth.signOut();
        throw new Error("Профиль пользователя не найден");
      }

      // Update store with user data
      useAuthStore.getState().setUser({
        id: data.user.id,
        username: profile.username || 'User',
        email: data.user.email || '',
        role: profile.role || 'user',
        createdAt: new Date(profile.created_at),
      });

      useAuthStore.getState().setSession(data.session);

      toast({
        title: "Успешно",
        description: "Вы вошли в систему",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear any partial state
      useAuthStore.getState().reset();
      
      toast({
        title: "Ошибка",
        description: error.message || "Ошибка входа",
        variant: "destructive",
      });
      throw error;
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  };

  const logout = async () => {
    try {
      useAuthStore.getState().setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth state
      useAuthStore.getState().reset();
      
      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
      throw error;
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  };

  return {
    login,
    logout,
  };
};