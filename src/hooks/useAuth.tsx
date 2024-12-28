import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: session.user.id,
              username: profile.username || "User",
              email: session.user.email || "",
              role: profile.role || "user",
              createdAt: new Date(session.user.created_at),
            });
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setSession(null);
        setUser(null);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      setSession(session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: session.user.id,
            username: profile.username || "User",
            email: session.user.email || "",
            role: profile.role || "user",
            createdAt: new Date(session.user.created_at),
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser({
            id: data.user.id,
            username: profile.username || "User",
            email: data.user.email || "",
            role: profile.role || "user",
            createdAt: new Date(data.user.created_at),
          });
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
      
      if (data.user) {
        // The profile will be created automatically by the database trigger
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
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any persisted session
      localStorage.removeItem('supabase.auth.token');
      
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