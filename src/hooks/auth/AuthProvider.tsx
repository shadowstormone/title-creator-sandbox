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

  useEffect(() => {
    console.log("AuthProvider: Initializing auth...");
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("AuthProvider: Got session:", session);
        
        if (mounted.current) {
          setSession(session);
          if (session?.user) {
            console.log("AuthProvider: Loading user profile...");
            await methods.loadUserProfile(session.user.id);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted.current) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (mounted.current) {
        setSession(session);
        if (session?.user) {
          await methods.loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

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