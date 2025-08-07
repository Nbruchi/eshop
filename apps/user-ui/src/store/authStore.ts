import { create } from 'zustand';

type AuthState = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: true,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
}));
