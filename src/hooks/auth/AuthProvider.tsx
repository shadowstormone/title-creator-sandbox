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
  const [loading, setLoading] = useState(false);
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
          if (mounted) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (!session) {
          console.log('No active session');
          if (mounted) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (session && mounted) {
          console.log('Session found:', session);
          
          // Verify that the session is valid by checking the user
          if (!session.user?.id) {
            console.log('Invalid session - no user ID');
            setUser(null);
            setSession(null);
            return;
          }

          setSession(session);
          
          const userProfile = await loadUserProfile(session.user.id);
          if (!userProfile) {
            console.log('No user profile found - logging out');
            await logout();
            return;
          }

          if (mounted) {
            console.log('User profile loaded:', userProfile);
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (!session || !session.user?.id) {
        if (mounted) {
          setUser(null);
          setSession(null);
        }
        return;
      }

      if (mounted) {
        setSession(session);
        const userProfile = await loadUserProfile(session.user.id);
        
        if (!userProfile) {
          console.log('No user profile found after state change - logging out');
          await logout();
          return;
        }

        if (mounted) {
          setUser(userProfile);
        }
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
        if (userProfile && mounted) {
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};