const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserApproval,
  deleteUser,
  toggleUserActivation,
  deactivateUser,
  activateUser,
  getPendingCourses,
  getPendingQuests,
  approveCourse,
  rejectCourse,
  approveQuest,
  rejectQuest,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUserRole)
  .delete(deleteUser);

router.route('/users/:id/approval')
  .put(updateUserApproval);

router.route('/users/:id/toggle-activation')
  .put(toggleUserActivation);

router.route('/users/:id/deactivate')
  .put(deactivateUser);

router.route('/users/:id/activate')
  .put(activateUser);

// Course approval routes
router.route('/courses/pending')
  .get(getPendingCourses);

router.route('/courses/:id/approval/approve')
  .put(approveCourse);

router.route('/courses/:id/approval/reject')
  .put(rejectCourse);

// Quest approval routes
router.route('/quests/pending')
  .get(getPendingQuests);

router.route('/quests/:id/approval/approve')
  .put(approveQuest);

router.route('/quests/:id/approval/reject')
  .put(rejectQuest);

// Dashboard statistics route
router.route('/dashboard/stats')
  .get(getDashboardStats);

module.exports = router;