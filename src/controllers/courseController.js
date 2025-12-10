const Course = require('../models/Course');
const User = require('../models/User');
const Material = require('../models/Material');
const Quest = require('../models/Quest');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    // Only return approved and published courses
    const courses = await Course.find({ 
      approvalStatus: 'approved', 
      isPublished: true 
    })
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
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('mentors', 'name email')
      .populate('materials')
      .populate('quests');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if the course is approved and published (for public access)
    if (course.approvalStatus !== 'approved' || !course.isPublished) {
      // Only allow access if user is creator, mentor, or admin
      if (req.user) {
        if (req.user.role !== 'admin' && 
            course.creator.toString() !== req.user.id &&
            !course.mentors.some(mentor => mentor.toString() === req.user.id)) {
          return res.status(404).json({
            success: false,
            message: 'Course not found'
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    }

    res.status(200).json({
      success: true,
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

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Mentor,Admin
exports.createCourse = async (req, res, next) => {
  try {
    // Add the creator ID to the request body
    req.body.creator = req.user.id;
    
    // Set approval status to pending by default
    req.body.approvalStatus = 'pending';
    
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
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

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Mentor,Admin
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the creator, a mentor for this course, or admin
    if (req.user.role !== 'admin' && 
        course.creator.toString() !== req.user.id &&
        !course.mentors.some(mentor => mentor.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Don't allow changing approval status through regular update
    if (req.body.approvalStatus) {
      delete req.body.approvalStatus;
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
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

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Mentor,Admin
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the creator, a mentor for this course, or admin
    if (req.user.role !== 'admin' && 
        course.creator.toString() !== req.user.id &&
        !course.mentors.some(mentor => mentor.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await course.remove();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get courses by mentor
// @route   GET /api/courses/mentor/my-courses
// @access  Private/Mentor,Admin
exports.getMentorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({
      $or: [
        { creator: req.user.id },
        { mentors: { $in: [req.user.id] } }
      ]
    })
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
};

// @desc    Get pending courses
// @route   GET /api/admin/courses/pending
// @access  Private/Admin
exports.getPendingCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ approvalStatus: 'pending' })
      .populate('creator', 'name email role')
      .populate('mentors', 'name email role')
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

// @desc    Approve course
// @route   PUT /api/admin/courses/:id/approve
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

    // Update approval status
    course.approvalStatus = 'approved';
    course.approvedBy = req.user.id;
    course.approvedAt = Date.now();
    course.isPublished = true; // Automatically publish when approved

    await course.save();

    res.status(200).json({
      success: true,
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
exports.rejectCourse = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update approval status
    course.approvalStatus = 'rejected';
    course.rejectionReason = rejectionReason;
    course.approvedBy = req.user.id;
    course.approvedAt = Date.now();

    await course.save();

    res.status(200).json({
      success: true,
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

// @desc    Update admin approved price
// @route   PUT /api/admin/courses/:id/approve-price
// @access  Private/Admin
exports.updateAdminApprovedPrice = async (req, res, next) => {
  try {
    const { amount, platformFee } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update admin approved price
    course.adminApprovedPrice = {
      amount: amount,
      currency: course.adminApprovedPrice?.currency || 'USD',
      approvedBy: req.user.id,
      approvedAt: Date.now()
    };

    if (platformFee !== undefined) {
      course.platformFee = platformFee;
    }

    await course.save();

    res.status(200).json({
      success: true,
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

// @desc    Publish course
// @route   PUT /api/courses/:id/publish
// @access  Private/Admin
exports.publishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization (only admin can publish/unpublish courses)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this course'
      });
    }

    course.isPublished = true;
    await course.save();

    res.status(200).json({
      success: true,
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

// @desc    Unpublish course
// @route   PUT /api/courses/:id/unpublish
// @access  Private/Admin
exports.unpublishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization (only admin can publish/unpublish courses)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unpublish this course'
      });
    }

    course.isPublished = false;
    await course.save();

    res.status(200).json({
      success: true,
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

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
exports.searchCourses = async (req, res, next) => {
  try {
    const { 
      keyword, 
      category, 
      minPrice, 
      maxPrice, 
      mentor, 
      difficulty,
      limit = 10,
      page = 1
    } = req.query;

    // Build query object
    const query = { 
      approvalStatus: 'approved', 
      isPublished: true 
    };

    // Add keyword search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    // Add mentor filter
    if (mentor) {
      query.mentors = { $in: [mentor] };
    }

    // Add difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const limitNum = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * limitNum;

    // Get courses with pagination
    const courses = await Course.find(query)
      .populate('creator', 'name email')
      .populate('mentors', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / limitNum),
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