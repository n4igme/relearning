const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMentorCourses,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  updateAdminApprovedPrice,
  searchCourses
} = require('../controllers/courseController');
const materialRoutes = require('./materials');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/')
  .get(getCourses);

router.route('/search')
  .get(searchCourses);

router.route('/:id')
  .get(getCourse);

// Private routes for mentors and admins
router.use(protect);

router.route('/')
  .post(createCourse);

router.route('/mentor/my-courses')
  .get(getMentorCourses);

router.route('/:id')
  .put(updateCourse)
  .delete(deleteCourse);

// Materials routes - nested under courses
router.use('/:courseId/materials', materialRoutes);

// Admin routes
router.use(authorize('admin'));

router.route('/pending')
  .get(getPendingCourses);

router.route('/:id/approve')
  .put(approveCourse);

router.route('/:id/reject')
  .put(rejectCourse);

router.route('/:id/approve-price')
  .put(updateAdminApprovedPrice);

module.exports = router;