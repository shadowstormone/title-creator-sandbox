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
    const initializeAuth = async () => {
      if (initAttempted) return;
      setInitAttempted(true);
      
      try {
        console.log('Начало инициализации аутентификации...');
        const restoredSession = await restoreSession();
        
        if (restoredSession?.user) {
          console.log('Загрузка профиля пользователя...');
          await methods.loadUserProfile(restoredSession.user.id);
          console.log('Профиль пользователя загружен');
        } else {
          console.log('Сессия отсутствует, пропуск загрузки профиля');
        }
      } catch (error) {
        console.error('Ошибка при инициализации аутентификации:', error);
      }
    };

    initializeAuth();
  }, [methods, initAttempted]);

  if (!initialized && !initAttempted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Загрузка сайта...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка при загрузке: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Обновить страницу
          </button>
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