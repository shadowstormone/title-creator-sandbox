import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { AuthContext } from "./AuthContext";
import { useSessionManager } from "./useSessionManager";
import { useToast } from "@/hooks/use-toast";
import { restoreSession } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading, initialized, error } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();
  const [initAttempted, setInitAttempted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  useSessionManager();

  useEffect(() => {
    let mounted = true;
    const initTimeout = 20000; // Увеличиваем до 20 секунд
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      if (!mounted || initAttempted) return;
      
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.error('Превышено время ожидания при инициализации');
          setInitAttempted(true);
          setInitError('Превышено время ожидания при инициализации');
          toast({
            title: "Ошибка",
            description: "Не удалось инициализировать приложение. Попробуйте перезагрузить страницу.",
            variant: "destructive",
          });
        }
      }, initTimeout);

      try {
        console.log("Начало инициализации аутентификации...");
        const restoredSession = await restoreSession() as Session | null;
        
        if (!mounted) return;
        
        clearTimeout(timeoutId);
        
        if (restoredSession?.user?.id) {
          console.log('Загрузка профиля пользователя...');
          await methods.loadUserProfile(restoredSession.user.id);
        } else {
          console.log('Сессия не найдена или недействительна');
        }
        
        setInitAttempted(true);
        setInitError(null);
      } catch (error) {
        console.error('Ошибка при инициализации:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setInitAttempted(true);
          setInitError(error instanceof Error ? error.message : 'Неизвестная ошибка');
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при загрузке профиля. Попробуйте перезагрузить страницу.",
            variant: "destructive",
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [methods, initAttempted, toast]);

  if (!initialized && !initAttempted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Загрузка...</p>
          {initError && (
            <p className="mt-2 text-sm text-red-400">{initError}</p>
          )}
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