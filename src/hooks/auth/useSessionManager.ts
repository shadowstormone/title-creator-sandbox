import { useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
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
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const initAuth = async () => {
      if (initializationAttempted || !mounted) return;
      initializationAttempted = true;

      // Устанавливаем таймаут для инициализации
      initializationTimeout = setTimeout(() => {
        if (!mounted) return;
        setError("Не удалось загрузить сайт из-за медленного соединения");
        setInitialized(true);
        setLoading(false);
      }, 10000); // 10 секунд максимум на инициализацию

      try {
        console.log("Начало загрузки сайта...");
        setLoading(true);

        // Проверяем подключение к Supabase
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Повторная попытка подключения (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(initAuth, 2000); // Пробуем снова через 2 секунды
            return;
          }
          throw new Error("Не удалось подключиться к серверу");
        }

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
        console.error("Ошибка загрузки сайта:", error);
        if (mounted) {
          setError(error instanceof Error ? error.message : "Неизвестная ошибка");
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте обновить страницу.",
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
            description: "Произошла ошибка при обновлении данных. Попробуйте обновить страницу.",
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