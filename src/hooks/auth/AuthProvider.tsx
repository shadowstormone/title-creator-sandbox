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

  const handleSessionChange = async (currentSession: Session | null) => {
    console.log("Handling session change:", currentSession?.user?.id);
    
    try {
      if (!currentSession?.user?.id) {
        setUser(null);
        setSession(null);
        return;
      }

      const userProfile = await loadUserProfile(currentSession.user.id);
      
      if (userProfile) {
        setSession(currentSession);
        setUser(userProfile);
      } else {
        console.log("No user profile found, logging out");
        setUser(null);
        setSession(null);
        await logout();
      }
    } catch (error) {
      console.error("Error handling session change:", error);
      setUser(null);
      setSession(null);
      await logout();
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (mounted) {
          await handleSessionChange(initialSession);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при инициализации авторизации",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await handleSessionChange(newSession);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    login,
    register: async (email: string, password: string, username: string) => {
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
    },
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