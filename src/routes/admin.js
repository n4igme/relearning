const express = require('express');
const {
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getPendingPrices,
  approveCoursePrice,
  rejectCoursePrice,
  getPendingQuests,
  approveQuest,
  rejectQuest,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Course management
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);

// Price management
router.get('/pricing/pending', getPendingPrices);
router.put('/courses/:id/approve-price', approveCoursePrice);
router.put('/courses/:id/reject-price', rejectCoursePrice);

// Quest management
router.get('/quests/pending', getPendingQuests);
router.put('/quests/:id/approve', approveQuest);
router.put('/quests/:id/reject', rejectQuest);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;
