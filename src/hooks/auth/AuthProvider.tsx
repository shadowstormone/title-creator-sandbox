import { useEffect, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/lib/types";
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
  const { user, session, loading, initialized, setSession, setInitialized } = useAuthStore();
  const methods = useAuthMethods();
  const mounted = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted.current) return;

        if (session?.user) {
          setSession(session);
          await methods.loadUserProfile(session.user.id);
          await trackIpSession(session.user.id);
        }
      } finally {
        if (mounted.current) {
          setInitialized(true);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      console.log("Auth state changed:", event);

      if (session?.user) {
        setSession(session);
        await methods.loadUserProfile(session.user.id);
        await trackIpSession(session.user.id);
      } else {
        useAuthStore.getState().reset();
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
      const isValid = await checkIpSession(user.id);
      if (!isValid) {
        toast({
          title: "Сессия истекла",
          description: "Вы были автоматически выходены из системы из-за длительного отсутствия активности",
          variant: "destructive",
        });
        methods.logout();
      } else {
        await updateIpActivity(user.id);
      }
    };

    const interval = setInterval(checkSession, IP_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);

  if (!initialized) {
    return null;
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