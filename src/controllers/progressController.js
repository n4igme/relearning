const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Material = require('../models/Material');
const Course = require('../models/Course');

// @desc    Get enrollment progress
// @route   GET /api/enrollments/:enrollmentId/progress
// @access  Private/Student (own enrollment) or Mentor/Admin
exports.getProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        enrollment.student.toString() !== req.user.id) {
      // For mentors, check if they are assigned to this course
      const course = await Course.findById(enrollment.course);
      if (req.user.role !== 'mentor' || 
          (course.creator.toString() !== req.user.id && 
           !course.mentors.some(mentor => mentor.toString() === req.user.id))) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this enrollment progress'
        });
      }
    }

    // Get all progress records for this enrollment
    const progressRecords = await Progress.find({ 
      enrollment: req.params.enrollmentId 
    });

    // Get all materials for the course to calculate completion
    const course = await Course.findById(enrollment.course);
    const totalMaterials = course.materials.length;

    const completedMaterials = progressRecords.filter(pr => pr.completed).length;
    const progressPercentage = totalMaterials > 0 
      ? Math.round((completedMaterials / totalMaterials) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        enrollmentId: enrollment._id,
        courseId: enrollment.course,
        totalMaterials,
        completedMaterials,
        progressPercentage,
        progressRecords
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

// @desc    Mark material as completed
// @route   POST /api/materials/:materialId/complete
// @access  Private/Student
exports.markMaterialComplete = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: material.course
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if already completed
    let progress = await Progress.findOne({
      enrollment: enrollment._id,
      material: req.params.materialId,
      user: req.user.id
    });

    if (progress && progress.completed) {
      return res.status(400).json({
        success: false,
        message: 'Material already marked as completed'
      });
    }

    if (progress) {
      // Update existing progress record
      progress.completed = true;
      progress.completedAt = Date.now();
      await progress.save();
    } else {
      // Create new progress record
      progress = await Progress.create({
        enrollment: enrollment._id,
        material: req.params.materialId,
        completed: true,
        completedAt: Date.now(),
        user: req.user.id
      });
    }

    // Update enrollment progress
    const totalMaterials = await Material.countDocuments({ course: material.course });
    const completedMaterials = await Progress.countDocuments({ 
      enrollment: enrollment._id, 
      completed: true 
    });
    
    const progressPercentage = Math.round((completedMaterials / totalMaterials) * 100);
    
    enrollment.progress = progressPercentage;
    
    // Check if all materials are completed
    if (progressPercentage === 100) {
      // Check if quest has been passed to mark course as completed
      if (enrollment.questPassed) {
        enrollment.completed = true;
      }
    }
    
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        progress,
        enrollmentProgress: enrollment.progress,
        message: 'Material marked as completed'
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

// @desc    Get student progress for a course
// @route   GET /api/student/courses/:courseId/progress
// @access  Private/Student
exports.getStudentCourseProgress = async (req, res, next) => {
  try {
    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Get all progress records for this enrollment
    const progressRecords = await Progress.find({ 
      enrollment: enrollment._id 
    }).populate('material', 'title type order');

    // Get all materials for the course to calculate completion
    const materials = await Material.find({ course: req.params.courseId });

    const totalMaterials = materials.length;
    const completedMaterials = progressRecords.filter(pr => pr.completed).length;
    const progressPercentage = totalMaterials > 0 
      ? Math.round((completedMaterials / totalMaterials) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        courseId: req.params.courseId,
        enrollmentId: enrollment._id,
        totalMaterials,
        completedMaterials,
        progressPercentage,
        materials: materials.map(material => {
          const progress = progressRecords.find(pr => 
            pr.material._id.toString() === material._id.toString()
          );
          return {
            ...material._doc,
            completed: progress ? progress.completed : false,
            completedAt: progress ? progress.completedAt : null
          };
        }),
        enrollment: {
          progress: enrollment.progress,
          completed: enrollment.completed,
          questAttempted: enrollment.questAttempted,
          questPassed: enrollment.questPassed
        }
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

// @desc    Update multiple materials completion status
// @route   POST /api/student/courses/:courseId/progress
// @access  Private/Student
exports.updateCourseProgress = async (req, res, next) => {
  try {
    const { materials } = req.body;

    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({
        success: false,
        message: 'Materials array is required'
      });
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Process each material update
    const results = [];
    for (const materialData of materials) {
      const { materialId, completed } = materialData;

      const material = await Material.findById(materialId);
      if (!material) {
        results.push({ materialId, error: 'Material not found' });
        continue;
      }

      if (material.course.toString() !== req.params.courseId) {
        results.push({ materialId, error: 'Material does not belong to this course' });
        continue;
      }

      // Check if already in desired state
      let progress = await Progress.findOne({
        enrollment: enrollment._id,
        material: materialId,
        user: req.user.id
      });

      if (progress && progress.completed === completed) {
        results.push({ 
          materialId, 
          status: 'already-updated', 
          completed: progress.completed 
        });
        continue;
      }

      if (progress) {
        // Update existing progress record
        progress.completed = completed;
        if (completed) {
          progress.completedAt = Date.now();
        }
        await progress.save();
      } else if (completed) {
        // Create new progress record only if setting to completed
        progress = await Progress.create({
          enrollment: enrollment._id,
          material: materialId,
          completed: true,
          completedAt: Date.now(),
          user: req.user.id
        });
      }

      results.push({ 
        materialId, 
        status: 'updated', 
        completed: completed 
      });
    }

    // Recalculate enrollment progress
    const totalMaterials = await Material.countDocuments({ course: req.params.courseId });
    const completedMaterials = await Progress.countDocuments({ 
      enrollment: enrollment._id, 
      completed: true 
    });
    
    const progressPercentage = Math.round((completedMaterials / totalMaterials) * 100);
    
    enrollment.progress = progressPercentage;
    
    // Check if all materials are completed
    if (progressPercentage === 100) {
      // Check if quest has been passed to mark course as completed
      if (enrollment.questPassed) {
        enrollment.completed = true;
      }
    }
    
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        enrollmentProgress: enrollment.progress,
        results
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