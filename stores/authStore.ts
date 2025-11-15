import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  sleeperUsername: string | null;
  isPasswordVerified: boolean;
  setUser: (user: User | null) => void;
  setSleeperUsername: (username: string | null) => void;
  setPasswordVerified: (verified: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sleeperUsername: null,
  isPasswordVerified: false,
  setUser: (user) => set({ user }),
  setSleeperUsername: (username) => set({ sleeperUsername: username }),
  setPasswordVerified: (verified) => set({ isPasswordVerified: verified }),
  clearAuth: () => set({ user: null, sleeperUsername: null, isPasswordVerified: false }),
}));

