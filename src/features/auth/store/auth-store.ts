import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  errorMessage: string | null;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (errorMessage: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: false,
  errorMessage: null,
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (errorMessage) => set({ errorMessage }),
}));
