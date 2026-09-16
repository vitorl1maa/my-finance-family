import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
  session: Session | null;
  isInitialized: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  setSession: (session: Session | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (errorMessage: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isInitialized: false,
  isLoading: false,
  errorMessage: null,
  setSession: (session) => set({ session }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (errorMessage) => set({ errorMessage }),
}));
