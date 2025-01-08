import { useEffect, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/lib/types";
import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading, initialized, setSession, setInitialized } = useAuthStore();
  const methods = useAuthMethods();
  const mounted = useRef(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted.current) return;

        if (session?.user) {
          setSession(session);
          await methods.loadUserProfile(session.user.id);
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
      } else {
        useAuthStore.getState().reset();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

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