import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { AuthContext } from "./AuthContext";
import { useSessionManager } from "./useSessionManager";
import { useToast } from "@/hooks/use-toast";
import { restoreSession } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading, initialized, error } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();
  const [initAttempted, setInitAttempted] = useState(false);
  useSessionManager();

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      if (!mounted || initAttempted) return;
      
      try {
        console.log("Начало инициализации аутентификации...");
        const restoredSession = await restoreSession();
        
        if (restoredSession?.user) {
          console.log('Загрузка профиля пользователя...');
          const userProfile = await methods.loadUserProfile(restoredSession.user.id);
          
          if (!userProfile && mounted) {
            console.error('Не удалось загрузить профиль пользователя');
            toast({
              title: "Ошибка",
              description: "Не удалось загрузить данные профиля",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Ошибка при инициализации:', error);
        if (mounted) {
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при загрузке профиля",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setInitAttempted(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [methods, initAttempted, toast]);

  if (!initialized && !initAttempted) {
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