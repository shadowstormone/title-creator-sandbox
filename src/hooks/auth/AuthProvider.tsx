import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { useProfileManagement } from "./useProfileManagement";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/lib/types";
import { Session } from "@supabase/supabase-js";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { login, logout } = useAuthMethods();
  const { loadUserProfile, updateProfile } = useProfileManagement();

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);
      
      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id);
        setUser(userProfile);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
    if (data.user) {
      const userProfile = await loadUserProfile(data.user.id);
      setUser(userProfile);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    loadUserProfile,
    updateProfile,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};