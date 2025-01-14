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
    const RETRY_DELAY = 3000; // Увеличили задержку между попытками
    const INITIALIZATION_TIMEOUT = 15000; // Увеличили общий таймаут

    const initAuth = async () => {
      if (initializationAttempted || !mounted) return;
      initializationAttempted = true;

      initializationTimeout = setTimeout(() => {
        if (!mounted) return;
        setError("Превышено время ожидания при загрузке");
        setInitialized(true);
        setLoading(false);
        toast({
          title: "Ошибка подключения",
          description: "Не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету и обновите страницу.",
          variant: "destructive",
        });
      }, INITIALIZATION_TIMEOUT);

      try {
        console.log("Начало инициализации аутентификации...");
        setLoading(true);

        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Повторная попытка подключения (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(initAuth, RETRY_DELAY);
            return;
          }
          throw new Error("Не удалось подключиться к серверу после нескольких попыток");
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          console.log("Найдена активная сессия");
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
        console.error("Ошибка инициализации:", error);
        if (mounted) {
          setError(error instanceof Error ? error.message : "Неизвестная ошибка");
          toast({
            title: "Ошибка подключения",
            description: "Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте позже.",
            variant: "destructive",
          });
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initAuth();

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
        console.error("Ошибка при изменении состояния:", error);
        setError(error instanceof Error ? error.message : "Неизвестная ошибка");
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
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