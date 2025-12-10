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
  getDashboardStats,
  publishCourse,
  unpublishCourse,
  getAllCourses
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

// Course management routes
router.route('/courses')
  .get(async (req, res, next) => {
    // Only accessible by admin users (protected by middleware above)
    try {
      const Course = require('../models/Course');

      const courses = await Course.find({})
        .populate('creator', 'name email')
        .populate('mentors', 'name email')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });

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

// Course publish/unpublish routes
router.route('/courses/:id/publish')
  .put(publishCourse);

router.route('/courses/:id/unpublish')
  .put(unpublishCourse);

module.exports = router;