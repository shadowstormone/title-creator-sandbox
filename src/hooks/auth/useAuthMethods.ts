import { supabase } from '@/lib/supabaseClient';
import { User } from '@/lib/types';
import { useAuthStore } from './useAuthStore';

export const useAuthMethods = () => {
  const { setUser, setLoading, reset } = useAuthStore();

  const loadUserProfile = async (userId: string) => {
    console.log("Loading user profile for ID:", userId);
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
        console.log("Setting user profile:", user);
        setUser(user);
      } else {
        console.log("No profile found, resetting state");
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
    console.log("Attempting login for email:", email);
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error("Login error:", error);
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
      
      console.log("Login successful");
    } catch (error) {
      reset();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    console.log("Attempting registration for email:", email);
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
      
      console.log("Registration successful");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("Attempting logout");
    try {
      setLoading(true);
      await supabase.auth.signOut();
      console.log("Logout successful");
    } finally {
      reset();
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    
    console.log("Updating profile for user:", currentUser.id);
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
      console.log("Profile updated successfully");
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