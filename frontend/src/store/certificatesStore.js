import { create } from 'zustand';
import { certificatesAPI } from '../utils/api';

const useCertificatesStore = create((set, get) => ({
  certificates: [],
  isLoading: false,
  error: null,

  getMyCertificates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await certificatesAPI.getMyCertificates();
      const { data } = response.data;
      set({ certificates: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get certificates';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  verifyCertificate: async (certificateNumber) => {
    set({ isLoading: true, error: null });
    try {
      const response = await certificatesAPI.verifyCertificate(certificateNumber);
      const { data } = response.data;
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify certificate';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Helper to get certificate by ID
  getCertificateById: (id) => {
    return get().certificates.find(cert => cert._id === id);
  }
}));

export default useCertificatesStore;