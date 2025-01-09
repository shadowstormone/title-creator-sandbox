import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';
import { useAuthStore } from './useAuthStore';

export const useAuthMethods = () => {
  const { setUser, setLoading, reset } = useAuthStore();

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        reset();
        return;
      }

      if (profile) {
        const user: User = {
          id: userId,
          username: profile.username || "User",
          email: profile.email || "",
          role: profile.role || "user",
          createdAt: new Date(profile.created_at),
        };
        setUser(user);
      } else {
        reset();
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      reset();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Неверный email или пароль");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Email не подтвержден. Проверьте вашу почту");
        } else if (error.message.includes("Invalid email")) {
          throw new Error("Некорректный email адрес");
        } else {
          throw new Error("Ошибка входа. Попробуйте позже");
        }
      }

      if (!data.user) {
        throw new Error("Ошибка входа. Попробуйте позже");
      }
    } catch (error) {
      reset();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
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
        throw new Error("Ошибка регистрации. Попробуйте позже");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } finally {
      reset();
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          role: data.role,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      const updatedUser = { ...currentUser, ...data };
      setUser(updatedUser);
    } finally {
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