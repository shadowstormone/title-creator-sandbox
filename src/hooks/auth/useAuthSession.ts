import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './useAuthStore';
import { useToast } from '@/hooks/use-toast';

export const useAuthSession = () => {
  const { setUser, setLoading, setError, reset } = useAuthStore();
  const { toast } = useToast();

  const handleSessionError = (error: Error) => {
    console.error('Session error:', error);
    setError(error.message);
    reset();
    toast({
      title: "Ошибка сессии",
      description: "Произошла ошибка при работе с сессией",
      variant: "destructive",
    });
  };

  const validateSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      handleSessionError(error as Error);
      return null;
    }
  };

  return {
    validateSession,
    handleSessionError
  };
};