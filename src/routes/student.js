const express = require('express');
const {
  enrollCourse,
  getEnrolledCourses,
  submitQuestAttempt,
  getQuestAttempts,
  getCertificates,
  getCertificate,
  getPaymentHistory,
  updateCourseProgress,
  completeMaterial,
  getCourseMaterials
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Course enrollment
router.post('/enroll/:courseId', authorize('student'), enrollCourse);
router.get('/courses', authorize('student'), getEnrolledCourses);
router.put('/courses/:courseId/progress', authorize('student'), updateCourseProgress);

// Course materials
router.get('/courses/:courseId/materials', authorize('student'), getCourseMaterials);
router.post('/courses/:courseId/materials/complete', authorize('student'), completeMaterial);

// Quest attempts
router.post('/quests/:questId/attempt', authorize('student'), submitQuestAttempt);
router.get('/quests/:questId/attempts', authorize('student'), getQuestAttempts);

// Certificates
router.get('/certificates', authorize('student'), getCertificates);
router.get('/certificates/:id', getCertificate); // Public

// Payments
router.get('/payments', authorize('student'), getPaymentHistory);

module.exports = router;
