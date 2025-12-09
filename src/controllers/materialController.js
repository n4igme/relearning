const Material = require('../models/Material');
const Course = require('../models/Course');
const upload = require('../middleware/upload');

// @desc    Get materials for a course
// @route   GET /api/courses/:courseId/materials
// @access  Private/Student (if enrolled), Mentor (if creator), Admin
exports.getCourseMaterials = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (req.user.role === 'student') {
      // For students, check if they're enrolled in the course
      // This check would require checking enrollment - for now we'll just check if course is approved
      if (course.approvalStatus !== 'approved' || !course.isPublished) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this course materials'
        });
      }
    } else if (req.user.role === 'mentor') {
      // For mentors, check if they have access to this course
      if (course.creator.toString() !== req.user.id && 
          !course.mentors.some(mentor => mentor.toString() === req.user.id) &&
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this course materials'
        });
      }
    }

    // Get materials for the course
    const materials = await Material.find({ course: req.params.courseId })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single material
// @route   GET /api/courses/:courseId/materials/:materialId
// @access  Private/Student (if enrolled), Mentor (if creator), Admin
exports.getMaterial = async (req, res, next) => {
  try {
    const material = await Material.findOne({
      _id: req.params.materialId,
      course: req.params.courseId
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check authorization
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (req.user.role === 'student') {
      if (course.approvalStatus !== 'approved' || !course.isPublished) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this material'
        });
      }
    } else if (req.user.role === 'mentor') {
      if (course.creator.toString() !== req.user.id && 
          !course.mentors.some(mentor => mentor.toString() === req.user.id) &&
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this material'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create material
// @route   POST /api/courses/:courseId/materials
// @access  Private/Mentor,Admin
exports.createMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

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
        message: 'Not authorized to add materials to this course'
      });
    }

    // Add course and creator to request body
    req.body.course = req.params.courseId;
    req.body.creator = req.user.id;

    const material = await Material.create(req.body);

    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update material
// @route   PUT /api/courses/:courseId/materials/:materialId
// @access  Private/Mentor,Admin
exports.updateMaterial = async (req, res, next) => {
  try {
    const material = await Material.findOne({
      _id: req.params.materialId,
      course: req.params.courseId
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const course = await Course.findById(req.params.courseId);

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
        message: 'Not authorized to update this material'
      });
    }

    const updatedMaterial = await Material.findOneAndUpdate(
      { _id: req.params.materialId, course: req.params.courseId },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete material
// @route   DELETE /api/courses/:courseId/materials/:materialId
// @access  Private/Mentor,Admin
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findOne({
      _id: req.params.materialId,
      course: req.params.courseId
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    const course = await Course.findById(req.params.courseId);

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
        message: 'Not authorized to delete this material'
      });
    }

    await Material.findByIdAndDelete(req.params.materialId);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload material file
// @route   POST /api/courses/:courseId/materials/:materialId/upload
// @access  Private/Mentor,Admin
exports.uploadMaterialFile = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      const material = await Material.findOne({
        _id: req.params.materialId,
        course: req.params.courseId
      });

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      const course = await Course.findById(req.params.courseId);

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
          message: 'Not authorized to upload files to this material'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Update material with file path
      material.filePath = req.file.path;
      await material.save();

      res.status(200).json({
        success: true,
        data: material
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];