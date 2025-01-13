import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useAuthMethods } from './useAuthMethods';
import { useToast } from '@/hooks/use-toast';

export const useSessionManager = () => {
  const { setSession, setLoading, setInitialized, reset } = useAuthStore();
  const methods = useAuthMethods();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let initializationAttempted = false;

    const initAuth = async () => {
      if (initializationAttempted || !mounted) return;
      initializationAttempted = true;

      try {
        console.log("Starting auth initialization...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log("Active session found for user:", session.user.id);
          setSession(session);
          await methods.loadUserProfile(session.user.id);
        } else {
          console.log("No active session found");
          reset();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось инициализировать сессию",
          variant: "destructive",
        });
        reset();
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          console.log("Auth initialization completed");
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event);
      setLoading(true);

      try {
        if (session?.user) {
          setSession(session);
          await methods.loadUserProfile(session.user.id);
          console.log("Profile updated after auth state change");
        } else {
          console.log("Resetting auth state");
          reset();
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        toast({
          title: "Ошибка",
          description: "Ошибка при обновлении сессии",
          variant: "destructive",
        });
        reset();
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