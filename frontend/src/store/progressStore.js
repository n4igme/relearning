import { create } from 'zustand';
import { progressAPI, enrollmentsAPI } from '../utils/api';

const useProgressStore = create((set, get) => ({
  progress: {},
  isLoading: false,
  error: null,

  getStudentCourseProgress: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressAPI.getStudentCourseProgress(courseId);
      const { data } = response.data;
      set({ 
        progress: { 
          ...get().progress, 
          [courseId]: data 
        }, 
        isLoading: false 
      });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get progress';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  markMaterialComplete: async (materialId, courseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressAPI.markMaterialComplete(materialId);
      const { enrollmentProgress } = response.data.data;
      
      // Update the progress state
      const currentProgress = get().progress[courseId];
      if (currentProgress) {
        set({ 
          progress: { 
            ...get().progress, 
            [courseId]: { 
              ...currentProgress, 
              enrollmentProgress 
            } 
          } 
        });
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark material as complete';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Helper to get specific course progress
  getCourseProgress: (courseId) => {
    return get().progress[courseId] || null;
  }
}));

export default useProgressStore;