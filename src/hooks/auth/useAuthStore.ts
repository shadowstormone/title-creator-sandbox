import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user, error: null }),
  setSession: (session) => set({ session, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    user: null,
    session: null,
    loading: false,
    error: null,
  }),
}));