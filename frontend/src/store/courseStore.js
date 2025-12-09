import { create } from 'zustand';
import { coursesAPI, progressAPI } from '../utils/api';

const useCourseStore = create((set, get) => ({
  courses: [],
  courseMaterials: {},
  isLoading: false,
  error: null,

  getAllCourses: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coursesAPI.getAll(params);
      const { data } = response.data;
      set({ courses: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get courses';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  getCourseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coursesAPI.getOne(id);
      const { data } = response.data;
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get course';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  addCourseMaterial: async (courseId, materialData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coursesAPI.addMaterial(courseId, materialData);
      const { data } = response.data;
      
      // Update course materials cache
      const currentMaterials = get().courseMaterials[courseId] || [];
      set({ 
        courseMaterials: { 
          ...get().courseMaterials, 
          [courseId]: [...currentMaterials, data] 
        } 
      });
      
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add material';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  getCourseMaterials: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressAPI.getStudentCourseProgress(courseId);
      const { data } = response.data;

      // Store materials with progress info
      set({
        courseMaterials: {
          ...get().courseMaterials,
          [courseId]: data.materials
        },
        isLoading: false
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get course materials';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get individual course materials via the student API
  getCourseMaterialsDirect: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentAPI.getCourseMaterials(courseId);
      const { data } = response.data;

      // Extract materials from course data
      set({
        courseMaterials: {
          ...get().courseMaterials,
          [courseId]: data.materials
        },
        isLoading: false
      });

      return { success: true, data: data.materials };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get course materials';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Proper method for getting course by ID
  getCourseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await coursesAPI.getOne(id);
      const { data } = response.data;
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get course';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  }
}));

export default useCourseStore;