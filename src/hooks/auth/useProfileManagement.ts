import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';
import { useAuthStore } from './useAuthStore';
import { useToast } from '@/hooks/use-toast';

export const useProfileManagement = () => {
  const { setUser, setError } = useAuthStore();
  const { toast } = useToast();

  const loadUserProfile = async (userId: string): Promise<User | null> => {
    console.log("Loading user profile for ID:", userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!profile) {
        console.log("No profile found");
        return null;
      }

      const user: User = {
        id: userId,
        username: profile.username || "User",
        email: profile.email || "",
        role: profile.role || "user",
        createdAt: new Date(profile.created_at),
      };

      console.log("User profile loaded:", user);
      setUser(user);
      return user;
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить профиль пользователя",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (!currentSession.session?.user.id) {
        throw new Error("Пользователь не авторизован");
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          role: data.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSession.session.user.id);

      if (error) throw error;

      const updatedProfile = await loadUserProfile(currentSession.session.user.id);
      if (!updatedProfile) {
        throw new Error("Не удалось обновить профиль");
      }

      toast({
        title: "Успешно",
        description: "Профиль успешно обновлен",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    loadUserProfile,
    updateProfile
  };
};