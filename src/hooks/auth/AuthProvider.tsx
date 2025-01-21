import { useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "./AuthContext";
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
  const [loading, setLoading] = useState(false); // Changed to false by default
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { login, logout } = useAuthMethods();
  const { loadUserProfile, updateProfile } = useProfileManagement();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          return;
        }

        if (session && mounted) {
          console.log('Session found:', session);
          setSession(session);
          
          if (session.user) {
            console.log('Loading user profile for:', session.user.id);
            const userProfile = await loadUserProfile(session.user.id);
            if (userProfile && mounted) {
              console.log('User profile loaded:', userProfile);
              setUser(userProfile);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    // Start auth initialization without blocking
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (session && mounted) {
        setSession(session);
        
        if (session.user) {
          const userProfile = await loadUserProfile(session.user.id);
          if (userProfile && mounted) {
            setUser(userProfile);
          }
        }
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setLoading(true);
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
        if (userProfile) {
          setUser(userProfile);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
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

  // Remove loading screen, let the app render immediately
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};