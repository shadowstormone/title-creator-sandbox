import { useEffect, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { AuthContext } from "./AuthContext";
import { checkIpSession, trackIpSession, updateIpActivity } from "./useIpSession";
import { useToast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: React.ReactNode;
}

const IP_CHECK_INTERVAL = 1000 * 60; // Check every minute

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading, initialized, setSession, setLoading, setInitialized } = useAuthStore();
  const methods = useAuthMethods();
  const mounted = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted.current) return;

        if (session?.user) {
          setSession(session);
          await methods.loadUserProfile(session.user.id);
          await trackIpSession(session.user.id);
        } else {
          useAuthStore.getState().reset();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        useAuthStore.getState().reset();
      } finally {
        if (mounted.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      console.log("Auth state changed:", event);
      setLoading(true);

      try {
        if (session?.user) {
          setSession(session);
          await methods.loadUserProfile(session.user.id);
          await trackIpSession(session.user.id);
        } else {
          useAuthStore.getState().reset();
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        useAuthStore.getState().reset();
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // IP session check interval
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        const isValid = await checkIpSession(user.id);
        if (!isValid) {
          toast({
            title: "Сессия истекла",
            description: "Вы были автоматически выходены из системы из-за длительного отсутствия активности",
            variant: "destructive",
          });
          await methods.logout();
        } else {
          await updateIpActivity(user.id);
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    const interval = setInterval(checkSession, IP_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading,
        ...methods 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};