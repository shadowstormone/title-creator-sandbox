import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";
import { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const startSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    const timer = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
    setSessionTimer(timer);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
          startSessionTimer();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
        startSessionTimer();
      } else {
        setUser(null);
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
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
        setUser({
          id: userId,
          username: profile.username || "User",
          email: profile.email || "",
          role: profile.role || "user",
          createdAt: new Date(profile.created_at),
        });
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
        console.error("Login error details:", error);
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

      if (data.user) {
        await loadUserProfile(data.user.id);
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
      
      if (data.user) {
        setUser({
          id: data.user.id,
          username,
          email: data.user.email || "",
          role: "user",
          createdAt: new Date(data.user.created_at),
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          role: data.role,
        })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};