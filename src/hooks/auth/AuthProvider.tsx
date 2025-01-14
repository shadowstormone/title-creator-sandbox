import { useAuthStore } from "./useAuthStore";
import { useAuthMethods } from "./useAuthMethods";
import { AuthContext } from "./AuthContext";
import { useSessionManager } from "./useSessionManager";
import { useToast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading, initialized, error } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();
  useSessionManager();

  // Показываем загрузочный экран только при первичной инициализации
  if (!initialized) {
    // Если загрузка длится более 5 секунд, показываем сообщение об ошибке
    setTimeout(() => {
      if (!initialized && !error) {
        toast({
          title: "Не удалось загрузить сайт",
          description: "Возможны проблемы с подключением к серверу. Пожалуйста, проверьте интернет-соединение и обновите страницу.",
          variant: "destructive",
        });
      }
    }, 5000);

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400">Загрузка сайта...</p>
          {error && (
            <div className="mt-4">
              <p className="text-sm text-red-400">
                Не удалось загрузить сайт. Проверьте подключение к интернету
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600 transition-colors"
              >
                Обновить страницу
              </button>
            </div>
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