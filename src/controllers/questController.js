const Quest = require('../models/Quest');
const Course = require('../models/Course');

// @desc    Create new quest
// @route   POST /api/quests
// @access  Private/Mentor/Admin
exports.createQuest = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      questions,
      passingScore,
      timeLimit
    } = req.body;

    // Validate required fields
    if (!title || !description || !courseId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is course creator or admin
    if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create quest for this course'
      });
    }

    const questData = {
      title,
      description,
      course: courseId,
      creator: req.user.id,
      questions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 60
    };

    // Admin quests are auto-approved
    if (req.user.role === 'admin') {
      questData.approvalStatus = 'approved';
      questData.approvedBy = req.user.id;
      questData.approvedAt = Date.now();
    }

    const quest = await Quest.create(questData);

    // If admin, add to course immediately
    if (req.user.role === 'admin') {
      course.quests.push(quest._id);
      await course.save();
    }

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin'
        ? 'Quest created and approved successfully'
        : 'Quest created and submitted for approval',
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

// @desc    Get all quests for a course
// @route   GET /api/quests/course/:courseId
// @access  Public
exports.getCourseQuests = async (req, res) => {
  try {
    const quests = await Quest.find({
      course: req.params.courseId,
      approvalStatus: 'approved',
      isActive: true
    }).select('-questions.correctAnswer -questions.options.isCorrect');

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

// @desc    Get single quest
// @route   GET /api/quests/:id
// @access  Private
exports.getQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate('course', 'title')
      .populate('creator', 'name');

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if user has access
    if (quest.approvalStatus !== 'approved' &&
        (!req.user || (req.user.id !== quest.creator._id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'This quest is not yet approved'
      });
    }

    // Remove correct answers from response for students
    let questData = quest.toObject();
    if (req.user.role === 'student') {
      questData.questions = questData.questions.map(q => {
        const question = { ...q };
        delete question.correctAnswer;
        if (question.options) {
          question.options = question.options.map(opt => ({
            text: opt.text
          }));
        }
        return question;
      });
    }

    res.status(200).json({
      success: true,
      data: questData
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
// @access  Private/Creator/Admin
exports.updateQuest = async (req, res) => {
  try {
    let quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check ownership
    if (quest.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quest'
      });
    }

    const {
      title,
      description,
      questions,
      passingScore,
      timeLimit
    } = req.body;

    // Update fields
    if (title) quest.title = title;
    if (description) quest.description = description;
    if (questions) quest.questions = questions;
    if (passingScore) quest.passingScore = passingScore;
    if (timeLimit) quest.timeLimit = timeLimit;

    // If questions changed, require re-approval for mentors
    if (questions && req.user.role !== 'admin' && quest.approvalStatus === 'approved') {
      quest.approvalStatus = 'pending';
    }

    await quest.save();

    res.status(200).json({
      success: true,
      message: 'Quest updated successfully',
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

// @desc    Delete quest
// @route   DELETE /api/quests/:id
// @access  Private/Creator/Admin
exports.deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check ownership
    if (quest.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quest'
      });
    }

    await quest.deleteOne();

    // Remove from course
    await Course.findByIdAndUpdate(
      quest.course,
      { $pull: { quests: quest._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Quest deleted successfully'
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
// @access  Private/Mentor
exports.getMyQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ creator: req.user.id })
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
