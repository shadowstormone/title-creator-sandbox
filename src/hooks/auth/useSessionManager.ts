import { useEffect } from 'react';
import { supabase, checkDatabaseConnection } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useAuthMethods } from './useAuthMethods';
import { useToast } from '@/hooks/use-toast';

export const useSessionManager = () => {
  const { setSession, setLoading, setError, reset } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!mounted) return;

      try {
        setLoading(true);
        const isConnected = await checkDatabaseConnection();
        
        if (!isConnected) {
          throw new Error("Не удалось подключиться к серверу");
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          setSession(session);
          await methods.login(session.user.email!, session.user.id);
        } else {
          reset();
        }

      } catch (error) {
        console.error("Ошибка инициализации:", error);
        setError(error instanceof Error ? error.message : "Неизвестная ошибка");
        toast({
          title: "Ошибка подключения",
          description: "Не удалось подключиться к серверу. Пожалуйста, войдите снова.",
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          setSession(session);
          await methods.login(session.user.email!, session.user.id);
        } else {
          reset();
        }
      } catch (error) {
        console.error("Ошибка при изменении состояния:", error);
        setError(error instanceof Error ? error.message : "Неизвестная ошибка");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
};