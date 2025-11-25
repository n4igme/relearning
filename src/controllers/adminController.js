const Course = require('../models/Course');
const Quest = require('../models/Quest');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

// @desc    Get all pending courses
// @route   GET /api/admin/courses/pending
// @access  Private/Admin
exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ approvalStatus: 'pending' })
      .populate('creator', 'name email')
      .sort('-createdAt');

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

// @desc    Approve course
// @route   PUT /api/admin/courses/:id/approve
// @access  Private/Admin
exports.approveCourse = async (req, res) => {
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
    course.isPublished = true;

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
// @route   PUT /api/admin/courses/:id/reject
// @access  Private/Admin
exports.rejectCourse = async (req, res) => {
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
    course.rejectionReason = reason || 'No reason provided';
    course.isPublished = false;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course rejected',
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

// @desc    Get all pending price proposals
// @route   GET /api/admin/pricing/pending
// @access  Private/Admin
exports.getPendingPrices = async (req, res) => {
  try {
    const courses = await Course.find({ priceApprovalStatus: 'pending' })
      .populate('creator', 'name email')
      .populate('price.proposedBy', 'name email')
      .sort('-createdAt');

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

// @desc    Approve course price
// @route   PUT /api/admin/courses/:id/approve-price
// @access  Private/Admin
exports.approveCoursePrice = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.priceApprovalStatus = 'approved';

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course price approved successfully',
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

// @desc    Reject course price
// @route   PUT /api/admin/courses/:id/reject-price
// @access  Private/Admin
exports.rejectCoursePrice = async (req, res) => {
  try {
    const { reason } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.priceApprovalStatus = 'rejected';
    course.rejectionReason = reason || 'No reason provided';

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course price rejected',
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

// @desc    Get all pending quests
// @route   GET /api/admin/quests/pending
// @access  Private/Admin
exports.getPendingQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ approvalStatus: 'pending' })
      .populate('creator', 'name email')
      .populate('course', 'title')
      .sort('-createdAt');

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

// @desc    Approve quest
// @route   PUT /api/admin/quests/:id/approve
// @access  Private/Admin
exports.approveQuest = async (req, res) => {
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

    // Add quest to course
    await Course.findByIdAndUpdate(
      quest.course,
      { $addToSet: { quests: quest._id } }
    );

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
// @route   PUT /api/admin/quests/:id/reject
// @access  Private/Admin
exports.rejectQuest = async (req, res) => {
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
    quest.rejectionReason = reason || 'No reason provided';

    await quest.save();

    res.status(200).json({
      success: true,
      message: 'Quest rejected',
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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'mentor', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
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

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
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

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalQuests = await Quest.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    const pendingCourses = await Course.countDocuments({ approvalStatus: 'pending' });
    const pendingQuests = await Quest.countDocuments({ approvalStatus: 'pending' });
    const pendingPrices = await Course.countDocuments({ priceApprovalStatus: 'pending' });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalQuests,
        totalCertificates,
        pendingCourses,
        pendingQuests,
        pendingPrices,
        usersByRole
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
