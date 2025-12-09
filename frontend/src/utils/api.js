import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/mentor/my-courses'),
  addMaterial: (courseId, data) => api.post(`/courses/${courseId}/materials`, data),
  updateMaterial: (courseId, materialId, data) => api.put(`/courses/${courseId}/materials/${materialId}`, data),
  deleteMaterial: (courseId, materialId) => api.delete(`/courses/${courseId}/materials/${materialId}`),
  addSubMaterial: (courseId, materialId, data) => api.post(`/courses/${courseId}/materials/${materialId}/sub-materials`, data),
  updateSubMaterial: (courseId, materialId, subMaterialId, data) => api.put(`/courses/${courseId}/materials/${materialId}/sub-materials/${subMaterialId}`, data),
  deleteSubMaterial: (courseId, materialId, subMaterialId) => api.delete(`/courses/${courseId}/materials/${materialId}/sub-materials/${subMaterialId}`),
};

// Quests API
export const questsAPI = {
  create: (data) => api.post('/quests', data),
  getCourseQuests: (courseId) => api.get(`/quests/course/${courseId}`),
  getOne: (id) => api.get(`/quests/${id}`),
  update: (id, data) => api.put(`/quests/${id}`, data),
  getMyQuests: () => api.get('/quests/mentor/my-quests'),
};

// Student API
export const studentAPI = {
  enroll: (courseId) => api.post(`/student/enroll/${courseId}`),
  getEnrolledCourses: () => api.get('/student/courses'),
  getCourseMaterials: (courseId) => api.get(`/student/courses/${courseId}/materials`),
  completeMaterial: (courseId, materialId, subMaterialId) =>
    api.post(`/student/courses/${courseId}/materials/complete`, { materialId, subMaterialId }),
  updateProgress: (courseId, progress) =>
    api.put(`/student/courses/${courseId}/progress`, { progress }),
  submitQuestAttempt: (questId, data) =>
    api.post(`/student/quests/${questId}/attempt`, data),
  getQuestAttempts: (questId) => api.get(`/student/quests/${questId}/attempts`),
  getCertificates: () => api.get('/student/certificates'),
  getCertificate: (id) => api.get(`/student/certificates/${id}`),
  getPayments: () => api.get('/student/payments'),
};

// Progress API
export const progressAPI = {
  getEnrollmentProgress: (enrollmentId) => api.get(`/progress/${enrollmentId}/progress`),
  getStudentCourseProgress: (courseId) => api.get(`/progress/student/courses/${courseId}/progress`),
  markMaterialComplete: (materialId) => api.post(`/progress/materials/${materialId}/complete`),
  updateCourseProgress: (courseId, data) => api.post(`/progress/student/courses/${courseId}/progress`, data),
};

// Certificates API
export const certificatesAPI = {
  generateCertificate: (data) => api.post('/certificates', data),
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  getCertificate: (id) => api.get(`/certificates/${id}`),
  verifyCertificate: (certificateNumber) => api.get(`/certificates/verify/${certificateNumber}`),
};

// Enrollments API
export const enrollmentsAPI = {
  create: (data) => api.post('/enrollments', data),
  getMyEnrollments: () => api.get('/enrollments/my-courses'),
  getEnrollment: (id) => api.get(`/enrollments/${id}`),
  initiatePayment: (id) => api.post(`/enrollments/${id}/initiate-payment`),
  confirmPayment: (id, data) => api.post(`/enrollments/${id}/confirm-payment`, data),
  getPaymentHistory: () => api.get('/enrollments/payments'),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingCourses: () => api.get('/admin/courses/pending'),
  approveCourse: (id) => api.put(`/admin/courses/${id}/approve`),
  rejectCourse: (id, reason) =>
    api.put(`/admin/courses/${id}/reject`, { reason }),
  getPendingPrices: () => api.get('/admin/pricing/pending'),
  approvePrice: (id) => api.put(`/admin/courses/${id}/approve-price`),
  rejectPrice: (id, reason) =>
    api.put(`/admin/courses/${id}/reject-price`, { reason }),
  getPendingQuests: () => api.get('/admin/quests/pending'),
  approveQuest: (id) => api.put(`/admin/quests/${id}/approve`),
  rejectQuest: (id, reason) =>
    api.put(`/admin/quests/${id}/reject`, { reason }),
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
};

// Forum API
export const forumAPI = {
  createQuestion: (data) => api.post('/forum', data),
  getCourseQuestions: (courseId, params) =>
    api.get(`/forum/course/${courseId}`, { params }),
  getQuestion: (id) => api.get(`/forum/${id}`),
  updateQuestion: (id, data) => api.put(`/forum/${id}`, data),
  deleteQuestion: (id) => api.delete(`/forum/${id}`),
  addReply: (id, content) => api.post(`/forum/${id}/reply`, { content }),
  updateReply: (questionId, replyId, content) =>
    api.put(`/forum/${questionId}/reply/${replyId}`, { content }),
  deleteReply: (questionId, replyId) =>
    api.delete(`/forum/${questionId}/reply/${replyId}`),
  acceptReply: (questionId, replyId) =>
    api.put(`/forum/${questionId}/reply/${replyId}/accept`),
  voteQuestion: (id, voteType) => api.post(`/forum/${id}/vote`, { voteType }),
  voteReply: (questionId, replyId, voteType) =>
    api.post(`/forum/${questionId}/reply/${replyId}/vote`, { voteType }),
};

// Payments API
export const paymentsAPI = {
  createIntent: (courseId) => api.post('/payments/create-intent', { courseId }),
  confirmPayment: (paymentIntentId) =>
    api.post('/payments/confirm', { paymentIntentId }),
  getPayment: (id) => api.get(`/payments/${id}`),
  requestRefund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
};

export default api;
