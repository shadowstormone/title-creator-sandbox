import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          username: session.user.user_metadata.username || "User",
          email: session.user.email || "",
          role: session.user.user_metadata.role || "user",
          createdAt: new Date(session.user.created_at),
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          username: session.user.user_metadata.username || "User",
          email: session.user.email || "",
          role: session.user.user_metadata.role || "user",
          createdAt: new Date(session.user.created_at),
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      setUser({
        id: data.user.id,
        username: data.user.user_metadata.username || "User",
        email: data.user.email || "",
        role: data.user.user_metadata.role || "user",
        createdAt: new Date(data.user.created_at),
      });
    }
  };

  const register = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: "user",
        },
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
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
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