import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';
import { useAuthStore } from './useAuthStore';

export const useAuthMethods = () => {
  const { setUser } = useAuthStore();

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("Loading user profile for ID:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setUser(null);
        return;
      }

      if (profile) {
        console.log("Profile loaded successfully:", profile);
        setUser({
          id: userId,
          username: profile.username || "User",
          email: profile.email || "",
          role: profile.role || "user",
          createdAt: new Date(profile.created_at),
        });
      } else {
        console.log("No profile found for user:", userId);
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
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
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            username,
            role: "user",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    try {
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
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
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