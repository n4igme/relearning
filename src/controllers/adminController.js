const User = require('../models/User');
const Course = require('../models/Course');
const Quest = require('../models/Quest');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'mentor', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role: admin, mentor, or student'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user approval status
// @route   PUT /api/admin/users/:id/approval
// @access  Private/Admin
exports.updateUserApproval = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;

    if (!approvalStatus || !['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid approval status: pending, approved, or rejected'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update approval status
    user.approvalStatus = approvalStatus;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Deactivate/activate user
// @route   PUT /api/admin/users/:id/toggle-activation
// @access  Private/Admin
exports.toggleUserActivation = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get pending courses
// @route   GET /api/admin/courses/pending
// @access  Private/Admin
exports.getPendingCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ approvalStatus: 'pending' })
      .populate('creator', 'name email')
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
};

// @desc    Get pending quests
// @route   GET /api/admin/quests/pending
// @access  Private/Admin
exports.getPendingQuests = async (req, res, next) => {
  try {
    const quests = await Quest.find({ approvalStatus: 'pending' })
      .populate('creator', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quests.length,
      data: quests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve course
// @route   PUT /api/admin/courses/:id/approval/approve
// @access  Private/Admin
exports.approveCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.approvalStatus = 'approved';
    course.approvedBy = req.user.id;
    course.approvedAt = Date.now();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course approved successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject course
// @route   PUT /api/admin/courses/:id/approval/reject
// @access  Private/Admin
exports.rejectCourse = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.approvalStatus = 'rejected';
    course.rejectionReason = reason;
    course.approvedBy = req.user.id;
    course.approvedAt = Date.now();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course rejected successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve quest
// @route   PUT /api/admin/quests/:id/approval/approve
// @access  Private/Admin
exports.approveQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    quest.approvalStatus = 'approved';
    quest.approvedBy = req.user.id;
    quest.approvedAt = Date.now();
    await quest.save();

    res.status(200).json({
      success: true,
      message: 'Quest approved successfully',
      data: quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject quest
// @route   PUT /api/admin/quests/:id/approval/reject
// @access  Private/Admin
exports.rejectQuest = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    quest.approvalStatus = 'rejected';
    quest.rejectionReason = reason;
    quest.approvedBy = req.user.id;
    quest.approvedAt = Date.now();
    await quest.save();

    res.status(200).json({
      success: true,
      message: 'Quest rejected successfully',
      data: quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count pending approval users
    const pendingUsers = await User.countDocuments({ approvalStatus: 'pending' });

    // Count approved users
    const approvedUsers = await User.countDocuments({ approvalStatus: 'approved' });

    // Count rejected users
    const rejectedUsers = await User.countDocuments({ approvalStatus: 'rejected' });

    // Count total courses
    const totalCourses = await Course.countDocuments();

    // Count pending courses
    const pendingCourses = await Course.countDocuments({ approvalStatus: 'pending' });

    // Count approved courses
    const approvedCourses = await Course.countDocuments({ approvalStatus: 'approved' });

    // Count total quests
    const totalQuests = await Quest.countDocuments();

    // Count pending quests
    const pendingQuests = await Quest.countDocuments({ approvalStatus: 'pending' });

    // Count active users
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get recent activities (new users, courses, etc.) - last 10 items
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt approvalStatus');

    const recentCourses = await Course.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title description creator createdAt approvalStatus');

    const recentQuests = await Quest.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title description creator course createdAt approvalStatus');

    // Compile recent activities with timestamps
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        message: `New user ${user.name} (${user.email}) registered`,
        user: { name: user.name, email: user.email },
        createdAt: user.createdAt,
        role: user.role
      });
    });

    // Add course creations
    recentCourses.forEach(course => {
      activities.push({
        type: 'course_created',
        message: `New course "${course.title}" created by ${course.creator?.name || 'Unknown'}`,
        course: { title: course.title, id: course._id },
        createdAt: course.createdAt,
        approvalStatus: course.approvalStatus
      });
    });

    // Add quest creations
    recentQuests.forEach(quest => {
      activities.push({
        type: 'quest_created',
        message: `New quest "${quest.title}" created`,
        quest: { title: quest.title, id: quest._id },
        createdAt: quest.createdAt,
        approvalStatus: quest.approvalStatus
      });
    });

    // Sort all activities by date (newest first) and take the most recent 10
    const recentActivities = activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        pendingUsers,
        approvedUsers,
        rejectedUsers,
        totalCourses,
        pendingCourses,
        approvedCourses,
        totalQuests,
        pendingQuests,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};