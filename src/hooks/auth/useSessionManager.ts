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

    const initAuth = async () => {
      if (initializationAttempted || !mounted) return;
      initializationAttempted = true;

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
      } catch (error) {
        console.error("Ошибка инициализации аутентификации:", error);
        if (mounted) {
          setError(error instanceof Error ? error.message : "Неизвестная ошибка");
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные пользователя. Попробуйте обновить страницу.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          console.log("Инициализация аутентификации завершена");
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
          console.log("Профиль обновлен после изменения состояния аутентификации");
        } else {
          console.log("Сброс состояния аутентификации");
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
      subscription.unsubscribe();
    };
  }, []);
};