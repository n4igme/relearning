const express = require('express');
const {
  getProgress,
  markMaterialComplete,
  getStudentCourseProgress,
  updateCourseProgress
} = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.use(protect);

router.route('/:enrollmentId/progress')
  .get(getProgress);

router.route('/materials/:materialId/complete')
  .post(markMaterialComplete);

router.route('/student/courses/:courseId/progress')
  .get(getStudentCourseProgress)
  .post(updateCourseProgress);

module.exports = router;