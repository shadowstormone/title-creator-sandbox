import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { AuthContext } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { initializeSession, checkDatabaseConnection } from "@/lib/supabaseClient";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      try {
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
          throw new Error('Cannot connect to database');
        }

        const result = await initializeSession();
        if (!result) {
          useAuthStore.getState().reset();
          return;
        }

        const { session, profile } = result;

        if (profile) {
          useAuthStore.getState().setUser({
            id: profile.id,
            username: profile.username || 'User',
            email: profile.email || '',
            role: profile.role || 'user',
            createdAt: new Date(profile.created_at),
          });
          useAuthStore.getState().setSession(session);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные пользователя",
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          useAuthStore.getState().setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, ...methods }}>
      {children}
    </AuthContext.Provider>
  );
};