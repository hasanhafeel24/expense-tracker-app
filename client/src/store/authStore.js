import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: localStorage.getItem('accessToken') || null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login(credentials);
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          const { user, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          // proceed even if logout API fails
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, isAuthenticated: false, error: null });
      },

      fetchMe: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { set({ isAuthenticated: false }); return; }
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },

      updateProfile: async (profileData) => {
        try {
          const { data } = await authAPI.updateProfile(profileData);
          set({ user: data.data.user });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
