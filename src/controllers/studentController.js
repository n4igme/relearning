const Course = require('../models/Course');
const Quest = require('../models/Quest');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Enroll in a course (create payment intent)
// @route   POST /api/student/enroll/:courseId
// @access  Private/Student
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.approvalStatus !== 'approved' || !course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This course is not available for enrollment'
      });
    }

    if (course.priceApprovalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Course pricing is not yet approved'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === course._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      student: req.user.id,
      course: course._id,
      amount: course.price.amount,
      currency: course.price.currency,
      status: 'completed', // In production, integrate with Stripe
      paymentMethod: 'stripe'
    });

    // Enroll user in course
    req.user.enrolledCourses.push({
      course: course._id,
      enrolledAt: Date.now(),
      progress: 0,
      completed: false
    });
    await req.user.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        payment,
        course
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

// @desc    Get enrolled courses
// @route   GET /api/student/courses
// @access  Private/Student
exports.getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'creator',
          select: 'name avatar'
        }
      });

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit quest attempt
// @route   POST /api/student/quests/:questId/attempt
// @access  Private/Student
exports.submitQuestAttempt = async (req, res) => {
  try {
    const { answers } = req.body;

    const quest = await Quest.findById(req.params.questId);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    if (quest.approvalStatus !== 'approved' || !quest.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This quest is not available'
      });
    }

    // Find enrollment
    const enrollment = req.user.enrolledCourses.find(
      enrollment => enrollment.course.toString() === quest.course.toString()
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to take this quest'
      });
    }

    // Check if all materials are completed (requirement before taking quest)
    if (enrollment.materialsProgress < 100) {
      return res.status(403).json({
        success: false,
        message: 'You must complete all course materials before taking the quest',
        data: {
          materialsProgress: enrollment.materialsProgress,
          required: 100
        }
      });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradedAnswers = quest.questions.map((question, index) => {
      totalPoints += question.points;
      const studentAnswer = answers.find(a => a.questionId === question._id.toString());

      let isCorrect = false;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (studentAnswer && studentAnswer.answer === correctOption.text) {
          isCorrect = true;
          earnedPoints += question.points;
        }
      } else if (question.type === 'short-answer') {
        // Simple case-insensitive comparison
        if (studentAnswer &&
            studentAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          isCorrect = true;
          earnedPoints += question.points;
        }
      }

      return {
        questionId: question._id,
        answer: studentAnswer ? studentAnswer.answer : null,
        isCorrect
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quest.passingScore;

    // Create attempt record
    const attempt = {
      student: req.user.id,
      answers: answers.map(a => ({
        questionId: a.questionId,
        answer: a.answer
      })),
      score,
      passed,
      startedAt: req.body.startedAt || Date.now(),
      completedAt: Date.now(),
      timeTaken: req.body.timeTaken || 0
    };

    quest.attempts.push(attempt);
    await quest.save();

    // If passed, generate certificate
    let certificate = null;
    if (passed) {
      certificate = await Certificate.create({
        student: req.user.id,
        course: quest.course,
        quest: quest._id,
        score,
        completionDate: Date.now()
      });

      // Add certificate to user
      req.user.certifications.push(certificate._id);

      // Update course completion
      const enrollmentIndex = req.user.enrolledCourses.findIndex(
        e => e.course.toString() === quest.course.toString()
      );
      if (enrollmentIndex !== -1) {
        req.user.enrolledCourses[enrollmentIndex].completed = true;
        req.user.enrolledCourses[enrollmentIndex].progress = 100;
        req.user.enrolledCourses[enrollmentIndex].questPassed = true;
        req.user.enrolledCourses[enrollmentIndex].questAttempted = true;
      }

      await req.user.save();
    } else {
      // Mark that quest was attempted even if failed
      const enrollmentIndex = req.user.enrolledCourses.findIndex(
        e => e.course.toString() === quest.course.toString()
      );
      if (enrollmentIndex !== -1) {
        req.user.enrolledCourses[enrollmentIndex].questAttempted = true;
      }
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quest!' : 'Quest completed. Keep trying!',
      data: {
        score,
        passed,
        earnedPoints,
        totalPoints,
        certificate: certificate ? certificate._id : null,
        gradedAnswers
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

// @desc    Get quest attempts
// @route   GET /api/student/quests/:questId/attempts
// @access  Private/Student
exports.getQuestAttempts = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.questId);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    const attempts = quest.attempts.filter(
      attempt => attempt.student.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
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
// @route   GET /api/student/certificates
// @access  Private/Student
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      student: req.user.id,
      isValid: true
    })
    .populate('course', 'title thumbnail')
    .populate('quest', 'title')
    .sort('-issueDate');

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

// @desc    Get single certificate
// @route   GET /api/student/certificates/:id
// @access  Public
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('quest', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
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

// @desc    Get payment history
// @route   GET /api/student/payments
// @access  Private/Student
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('course', 'title thumbnail')
      .sort('-paymentDate');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark material/sub-material as completed
// @route   POST /api/student/courses/:courseId/materials/complete
// @access  Private/Student
exports.completeMaterial = async (req, res) => {
  try {
    const { materialId, subMaterialId } = req.body;
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find enrollment
    const enrollmentIndex = req.user.enrolledCourses.findIndex(
      e => e.course.toString() === courseId
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Verify the material/sub-material exists in the course
    const material = course.materials.find(m => m._id.toString() === materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found in this course'
      });
    }

    const subMaterial = material.subMaterials.find(
      sm => sm._id.toString() === subMaterialId
    );
    if (!subMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Sub-material not found in this material'
      });
    }

    // Check if already completed
    const alreadyCompleted = req.user.enrolledCourses[enrollmentIndex].materialsCompleted.some(
      mc => mc.subMaterialId.toString() === subMaterialId &&
            mc.materialId.toString() === materialId
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: 'This material is already marked as completed'
      });
    }

    // Add to completed materials
    req.user.enrolledCourses[enrollmentIndex].materialsCompleted.push({
      materialId,
      subMaterialId,
      completedAt: Date.now()
    });

    // Calculate progress
    const totalSubMaterials = course.materials.reduce(
      (sum, m) => sum + m.subMaterials.length,
      0
    );

    const completedCount = req.user.enrolledCourses[enrollmentIndex].materialsCompleted.length;
    const progress = Math.round((completedCount / totalSubMaterials) * 100);

    req.user.enrolledCourses[enrollmentIndex].progress = progress;
    req.user.enrolledCourses[enrollmentIndex].materialsProgress = progress;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Material marked as completed',
      data: {
        progress,
        materialsProgress: progress,
        completedCount,
        totalSubMaterials,
        enrollment: req.user.enrolledCourses[enrollmentIndex]
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

// @desc    Get course materials and progress
// @route   GET /api/student/courses/:courseId/materials
// @access  Private/Student
exports.getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check enrollment
    const enrollment = req.user.enrolledCourses.find(
      e => e.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Build response with completion status
    const materialsWithStatus = course.materials.map(material => ({
      _id: material._id,
      title: material.title,
      description: material.description,
      order: material.order,
      subMaterials: material.subMaterials.map(subMaterial => {
        const isCompleted = enrollment.materialsCompleted.some(
          mc => mc.subMaterialId.toString() === subMaterial._id.toString()
        );
        return {
          _id: subMaterial._id,
          title: subMaterial.title,
          type: subMaterial.type,
          content: subMaterial.content,
          url: subMaterial.url,
          duration: subMaterial.duration,
          order: subMaterial.order,
          completed: isCompleted
        };
      })
    }));

    // Calculate total stats
    const totalSubMaterials = course.materials.reduce(
      (sum, m) => sum + m.subMaterials.length,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description
        },
        materials: materialsWithStatus,
        progress: enrollment.materialsProgress,
        completedCount: enrollment.materialsCompleted.length,
        totalSubMaterials,
        allMaterialsCompleted: enrollment.materialsProgress === 100
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

// @desc    Update course progress (legacy - kept for backwards compatibility)
// @route   PUT /api/student/courses/:courseId/progress
// @access  Private/Student
exports.updateCourseProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    const enrollmentIndex = req.user.enrolledCourses.findIndex(
      e => e.course.toString() === req.params.courseId
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    req.user.enrolledCourses[enrollmentIndex].progress = progress;

    if (progress >= 100) {
      req.user.enrolledCourses[enrollmentIndex].completed = true;
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: req.user.enrolledCourses[enrollmentIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
