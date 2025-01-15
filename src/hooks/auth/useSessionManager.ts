import { useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useAuthMethods } from './useAuthMethods';
import { useToast } from '@/hooks/use-toast';
import { trackIpSession, checkIpSession, updateIpActivity } from '@/hooks/auth/useIpSession';

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
    const RETRY_DELAY = 3000;
    const INITIALIZATION_TIMEOUT = 15000;

    const initAuth = async () => {
      if (initializationAttempted || !mounted) return;
      initializationAttempted = true;

      try {
        console.log("Начало инициализации аутентификации...");
        setLoading(true);

        // Очистка существующей сессии если инициализация занимает слишком много времени
        initializationTimeout = setTimeout(() => {
          if (!mounted) return;
          console.log("Превышено время ожидания, сброс сессии...");
          supabase.auth.signOut().then(() => {
            if (mounted) {
              setError("Превышено время ожидания при загрузке");
              setInitialized(true);
              setLoading(false);
              localStorage.removeItem('supabase.auth.token');
              toast({
                title: "Ошибка подключения",
                description: "Не удалось подключиться к серверу. Пожалуйста, войдите снова.",
                variant: "destructive",
              });
            }
          });
        }, INITIALIZATION_TIMEOUT);

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
        
        if (sessionError) {
          console.error("Ошибка получения сессии:", sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log("Найдена активная сессия");
          const hasValidIpSession = await checkIpSession(session.user.id);
          
          if (hasValidIpSession) {
            setSession(session);
            await methods.loadUserProfile(session.user.id);
            await updateIpActivity(session.user.id);
          } else {
            console.log("IP сессия устарела или не найдена, требуется повторный вход");
            await supabase.auth.signOut();
            reset();
          }
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
          localStorage.removeItem('supabase.auth.token');
          toast({
            title: "Ошибка подключения",
            description: "Не удалось подключиться к серверу. Пожалуйста, войдите снова.",
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
          if (event === 'SIGNED_IN') {
            await trackIpSession(session.user.id);
          }
          setSession(session);
          await methods.loadUserProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            toast({
              title: "Успешный вход",
              description: "Вы успешно вошли в систему",
            });
          }
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