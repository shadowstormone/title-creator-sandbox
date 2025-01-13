import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';
import { useAuthStore } from './useAuthStore';
import { useToast } from '@/hooks/use-toast';

export const useAuthMethods = () => {
  const { setUser, setLoading, setError, reset } = useAuthStore();
  const { toast } = useToast();

  const loadUserProfile = async (userId: string): Promise<User | null> => {
    console.log("Loading user profile for ID:", userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setError(error.message);
        return null;
      }

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
      return null;
    }
  };

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
        console.error("Login error:", error);
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

      console.log("Login successful");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
      reset();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<void> => {
    console.log("Attempting registration for email:", email);
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

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось зарегистрироваться",
          variant: "destructive",
        });
        throw error;
      }

      if (!data.user) {
        throw new Error("Не удалось создать пользователя");
      }

      toast({
        title: "Успешно",
        description: "Проверьте вашу почту для подтверждения регистрации",
      });

      console.log("Registration successful");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log("Attempting logout");
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }

      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });

      console.log("Logout successful");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
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
  };
};