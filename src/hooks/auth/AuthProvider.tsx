import { createContext, useContext, useEffect, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/lib/types";
import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { Loader2 } from "lucide-react";

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
  const { user, session, loading, setSession, setLoading, setUser } = useAuthStore();
  const methods = useAuthMethods();
  const mounted = useRef(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log("AuthProvider: Initial render, showing content immediately");
    setLoading(false);

    const initAuth = async () => {
      try {
        console.log("AuthProvider: Checking existing session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted.current) return;

        if (session?.user) {
          console.log("AuthProvider: Found existing session, loading user profile");
          setSession(session);
          await methods.loadUserProfile(session.user.id);
        } else {
          console.log("AuthProvider: No existing session");
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted.current) {
          setUser(null);
          setSession(null);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (!mounted.current) return;

      if (session?.user) {
        setSession(session);
        await methods.loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, ...methods }}>
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