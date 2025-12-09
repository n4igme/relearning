const Quest = require('../models/Quest');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');

// @desc    Get quest for a course
// @route   GET /api/quests/course/:courseId
// @access  Private/Student (if enrolled), Mentor (if creator), Admin
exports.getCourseQuest = async (req, res, next) => {
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

      // Check if student has completed 100% of materials before allowing access to quest
      if (enrollment.progress < 100) {
        return res.status(403).json({
          success: false,
          message: 'Must complete 100% of course materials before accessing quest'
        });
      }
    } else if (req.user.role === 'mentor') {
      // For mentors, check if they have access to this course
      if (course.creator.toString() !== req.user.id && 
          !course.mentors.some(mentor => mentor.toString() === req.user.id) &&
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this quest'
        });
      }
    }

    // Get the quest for the course
    const quest = await Quest.findOne({ course: req.params.courseId })
      .populate('creator', 'name email');

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'No quest found for this course'
      });
    }

    res.status(200).json({
      success: true,
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

// @desc    Get single quest
// @route   GET /api/quests/:id
// @access  Private/Student (if enrolled in course), Mentor (if creator), Admin
exports.getQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate('course', 'title description')
      .populate('creator', 'name email');

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    const course = await Course.findById(quest.course);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (req.user.role === 'student') {
      // For students, check if they're enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: quest.course
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Not enrolled in this course'
        });
      }

      // Check if student has completed 100% of materials before allowing access to quest
      if (enrollment.progress < 100) {
        return res.status(403).json({
          success: false,
          message: 'Must complete 100% of course materials before accessing quest'
        });
      }
    } else if (req.user.role === 'mentor') {
      // For mentors, check if they have access to this course
      if (course.creator.toString() !== req.user.id && 
          !course.mentors.some(mentor => mentor.toString() === req.user.id) &&
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this quest'
        });
      }
    }

    res.status(200).json({
      success: true,
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

// @desc    Create quest
// @route   POST /api/quests
// @access  Private/Mentor,Admin
exports.createQuest = async (req, res, next) => {
  try {
    const { title, description, course: courseId, questions, passingScore } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
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
        message: 'Not authorized to create a quest for this course'
      });
    }

    // Add creator to request body
    req.body.creator = req.user.id;

    const quest = await Quest.create(req.body);

    // Link the quest to the course
    await Course.findByIdAndUpdate(courseId, {
      $push: { quests: quest._id }
    });

    res.status(201).json({
      success: true,
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

// @desc    Update quest
// @route   PUT /api/quests/:id
// @access  Private/Mentor (if creator), Admin
exports.updateQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    const course = await Course.findById(quest.course);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the creator, or admin (since mentors can be assigned to courses by admins)
    if (req.user.role !== 'admin' && quest.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quest'
      });
    }

    const updatedQuest = await Quest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedQuest
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
// @route   POST /api/quests/:id/submit
// @access  Private/Student
exports.submitQuest = async (req, res, next) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quest.course
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if student has completed 100% of materials
    if (enrollment.progress < 100) {
      return res.status(403).json({
        success: false,
        message: 'Must complete 100% of course materials before taking quest'
      });
    }

    // Check if the student has already passed the quest
    if (enrollment.questPassed) {
      return res.status(400).json({
        success: false,
        message: 'You have already passed this quest'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const questQuestions = quest.questions;

    for (let i = 0; i < questQuestions.length; i++) {
      const questQuestion = questQuestions[i];
      const userAnswer = answers.find(answer => 
        answer.questionId.toString() === questQuestion._id.toString()
      );

      if (userAnswer) {
        if (questQuestion.type === 'multiple-choice' || questQuestion.type === 'true-false') {
          // For multiple choice, check the selected option
          if (questQuestion.options && questQuestion.options.length > 0) {
            const selectedOption = questQuestion.options.find(option => 
              option._id.toString() === userAnswer.answer
            );
            
            if (selectedOption && selectedOption.isCorrect) {
              correctAnswers++;
            }
          }
        } else if (questQuestion.type === 'short-answer') {
          // For short answer, check against correctAnswer field (case insensitive)
          if (questQuestion.correctAnswer && 
              userAnswer.answer.toLowerCase() === questQuestion.correctAnswer.toLowerCase()) {
            correctAnswers++;
          }
        }
      }
    }

    const score = Math.round((correctAnswers / questQuestions.length) * 100);
    const passed = score >= quest.passingScore;

    // Create attempt record
    const attempt = {
      student: req.user.id,
      answers: answers,
      score: score,
      passed: passed,
      startedAt: new Date(Date.now() - quest.timeLimit * 60000), // Assuming they started quest.timeLimit ago
      completedAt: Date.now(),
      timeTaken: quest.timeLimit // Placeholder - in real implementation, track actual time
    };

    // Add attempt to quest
    quest.attempts.push(attempt);
    await quest.save();

    // Update enrollment record
    enrollment.questAttempted = true;
    enrollment.questPassed = passed;
    
    if (passed) {
      enrollment.completed = true;
    }
    
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        attempt,
        score,
        passed,
        message: passed ? 'Congratulations! You passed the quest!' : `You need ${quest.passingScore}% to pass. Try again!`
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

// @desc    Get quest attempts for user
// @route   GET /api/quests/:id/attempts
// @access  Private/Student
exports.getQuestAttempts = async (req, res, next) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: quest.course
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Find attempts by this student
    const studentAttempts = quest.attempts.filter(attempt => 
      attempt.student.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      count: studentAttempts.length,
      data: studentAttempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get mentor's quests
// @route   GET /api/quests/mentor/my-quests
// @access  Private/Mentor,Admin
exports.getMentorQuests = async (req, res, next) => {
  try {
    const quests = await Quest.find({ 
      creator: req.user.id 
    })
    .populate('course', 'title description')
    .populate('creator', 'name email')
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

// @desc    Get pending quests
// @route   GET /api/admin/quests/pending
// @access  Private/Admin
exports.getPendingQuests = async (req, res, next) => {
  try {
    const quests = await Quest.find({ approvalStatus: 'pending' })
      .populate('course', 'title description')
      .populate('creator', 'name email')
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

// @desc    Approve quest
// @route   PUT /api/admin/quests/:id/approve
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

    // Update approval status
    quest.approvalStatus = 'approved';
    quest.approvedBy = req.user.id;
    quest.approvedAt = Date.now();

    await quest.save();

    res.status(200).json({
      success: true,
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
exports.rejectQuest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Update approval status
    quest.approvalStatus = 'rejected';
    quest.rejectionReason = rejectionReason;
    quest.approvedBy = req.user.id;
    quest.approvedAt = Date.now();

    await quest.save();

    res.status(200).json({
      success: true,
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