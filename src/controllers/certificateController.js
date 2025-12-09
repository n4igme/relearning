const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Quest = require('../models/Quest');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// @desc    Generate certificate after passing quest
// @route   POST /api/certificates/generate
// @access  Private/Student
exports.generateCertificate = async (req, res, next) => {
  try {
    const { courseId, questId, score } = req.body;

    // Validate course and quest
    const course = await Course.findById(courseId);
    const quest = await Quest.findById(questId);

    if (!course || !quest) {
      return res.status(404).json({
        success: false,
        message: 'Course or quest not found'
      });
    }

    if (quest.course.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: 'Quest does not belong to this course'
      });
    }

    // Check if student passed the quest (score >= passing score)
    if (score < quest.passingScore) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate certificate for failed quest attempt'
      });
    }

    // Check if user is enrolled in the course and passed the quest
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!enrollment || !enrollment.questPassed) {
      return res.status(403).json({
        success: false,
        message: 'You must pass the quest to generate a certificate'
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this course'
      });
    }

    // Create certificate
    const certificate = await Certificate.create({
      student: req.user.id,
      course: courseId,
      quest: questId,
      score: score,
      completionDate: Date.now()
    });

    // Add certificate to user
    const user = await User.findById(req.user.id);
    user.certifications.push(certificate._id);
    await user.save();

    // Update enrollment to mark as completed
    enrollment.completed = true;
    await enrollment.save();

    res.status(201).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student certificates
// @route   GET /api/certificates/my-certificates
// @access  Private/Student
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ 
      student: req.user.id 
    })
    .populate('course', 'title description thumbnail')
    .populate('quest', 'title description')
    .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private (Student/Creator) or Public for verification
exports.getCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('course', 'title description')
      .populate('quest', 'title description');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // For students, only allow access to their own certificates
    // For public access (verification), allow without auth
    if (req.user && req.user.id !== certificate.student._id) {
      // Check if user is a mentor for the course or admin
      const course = await Course.findById(certificate.course._id);
      if (req.user.role === 'mentor') {
        if (course.creator.toString() !== req.user.id && 
            !course.mentors.some(mentor => mentor.toString() === req.user.id)) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to access this certificate'
          });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this certificate'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify certificate by certificate number
// @route   GET /api/certificates/verify/:number
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateNumber: req.params.number 
    })
    .populate('student', 'name email')
    .populate('course', 'title description')
    .populate('quest', 'title description');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid certificate number'
      });
    }

    // Check if certificate is still valid (not revoked)
    if (!certificate.isValid) {
      return res.status(400).json({
        success: false,
        message: 'This certificate has been revoked'
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all certificates (admin)
// @route   GET /api/admin/certificates
// @access  Private/Admin
exports.getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({})
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('quest', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Revoke certificate (admin)
// @route   PUT /api/admin/certificates/:id/revoke
// @access  Private/Admin
exports.revokeCertificate = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Update certificate to revoked
    certificate.isValid = false;
    certificate.revokedAt = Date.now();
    certificate.revokedBy = req.user.id;
    certificate.revokeReason = reason;

    await certificate.save();

    res.status(200).json({
      success: true,
      data: certificate,
      message: 'Certificate revoked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get certificates by student (admin)
// @route   GET /api/admin/certificates/student/:studentId
// @access  Private/Admin
exports.getCertificatesByStudent = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ 
      student: req.params.studentId 
    })
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('quest', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};