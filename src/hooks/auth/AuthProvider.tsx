import { useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { useProfileManagement } from "./useProfileManagement";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/lib/types";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { login, logout } = useAuthMethods();
  const { loadUserProfile, updateProfile } = useProfileManagement();
  const { toast } = useToast();

  useEffect(() => {
    let isSubscribed = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Очищаем текущую сессию при инициализации
        await supabase.auth.signOut();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (isSubscribed) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (!session || !session.user?.id) {
          console.log('No valid session found');
          if (isSubscribed) {
            setUser(null);
            setSession(null);
          }
          return;
        }

        if (isSubscribed) {
          setSession(session);
          const userProfile = await loadUserProfile(session.user.id);
          
          if (!userProfile) {
            console.log('No user profile found - logging out');
            await logout();
            return;
          }

          if (isSubscribed) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isSubscribed) {
          setUser(null);
          setSession(null);
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при инициализации авторизации",
            variant: "destructive",
          });
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (!session || !session.user?.id) {
        if (isSubscribed) {
          setUser(null);
          setSession(null);
        }
        return;
      }

      if (isSubscribed) {
        setSession(session);
        const userProfile = await loadUserProfile(session.user.id);
        
        if (!userProfile) {
          console.log('No user profile found after state change - logging out');
          await logout();
          return;
        }

        if (isSubscribed) {
          setUser(userProfile);
        }
      }
    });

    return () => {
      isSubscribed = false;
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};