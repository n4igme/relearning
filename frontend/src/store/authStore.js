import { create } from 'zustand';
import { authAPI } from '../utils/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getMe();
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.verifyEmail(token);
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (updatedUser) {
        updatedUser.emailVerified = true;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser, isLoading: false });
      }
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.resendVerification({ email });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.forgotPassword({ email });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send password reset email';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.resetPassword(token, { password: newPassword });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  refreshToken: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.refreshToken();
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: false, error: error.message };
    }
  }
}));

export default useAuthStore;
