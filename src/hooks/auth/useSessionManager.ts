import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useAuthMethods } from './useAuthMethods';
import { useToast } from '@/hooks/use-toast';

export const useSessionManager = () => {
  const { setSession, setLoading, setInitialized, setError, reset } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let initializationAttempted = false;
    let initializationTimeout: NodeJS.Timeout;

    const initAuth = async () => {
      if (initializationAttempted || !mounted) return;
      initializationAttempted = true;

      // Устанавливаем таймаут для инициализации
      initializationTimeout = setTimeout(() => {
        if (!mounted) return;
        setError("Превышено время ожидания инициализации");
        setInitialized(true);
        setLoading(false);
      }, 10000); // 10 секунд максимум на инициализацию

      try {
        console.log("Начало инициализации аутентификации...");
        setLoading(true);

        // Проверяем соединение с Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Ошибка сессии:", sessionError);
          throw sessionError;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log("Найдена активная сессия для пользователя:", session.user.id);
          setSession(session);
          await methods.loadUserProfile(session.user.id);
        } else {
          console.log("Активная сессия не найдена");
          reset();
        }

        clearTimeout(initializationTimeout);
        if (mounted) {
          setInitialized(true);
          setLoading(false);
          setError(null);
        }
      } catch (error) {
        console.error("Ошибка инициализации аутентификации:", error);
        if (mounted) {
          setError(error instanceof Error ? error.message : "Неизвестная ошибка");
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные пользователя. Попробуйте обновить страницу.",
            variant: "destructive",
          });
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    // Запускаем инициализацию
    initAuth();

    // Подписываемся на изменения состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Изменение состояния аутентификации:", event);
      setLoading(true);

      try {
        if (session?.user) {
          setSession(session);
          await methods.loadUserProfile(session.user.id);
        } else {
          reset();
        }
      } catch (error) {
        console.error("Ошибка при изменении состояния аутентификации:", error);
        if (mounted) {
          setError(error instanceof Error ? error.message : "Неизвестная ошибка");
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при обновлении сессии",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, []);
};