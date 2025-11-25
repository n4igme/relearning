const ForumQuestion = require('../models/Forum');
const Course = require('../models/Course');

// @desc    Create new forum question
// @route   POST /api/forum
// @access  Private
exports.createQuestion = async (req, res) => {
  try {
    const { title, content, courseId, tags } = req.body;

    if (!title || !content || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and courseId'
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

    // Check if user is enrolled or is mentor/admin
    const isEnrolled = req.user.enrolledCourses.some(
      e => e.course.toString() === courseId
    );
    const isMentorOrAdmin = req.user.role === 'mentor' || req.user.role === 'admin';
    const isCourseCreator = course.creator.toString() === req.user.id;

    if (!isEnrolled && !isMentorOrAdmin && !isCourseCreator) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to post questions'
      });
    }

    const question = await ForumQuestion.create({
      title,
      content,
      course: courseId,
      author: req.user.id,
      tags: tags || []
    });

    const populatedQuestion = await ForumQuestion.findById(question._id)
      .populate('author', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Question posted successfully',
      data: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all questions for a course
// @route   GET /api/forum/course/:courseId
// @access  Public
exports.getCourseQuestions = async (req, res) => {
  try {
    const {
      sortBy = '-createdAt',
      page = 1,
      limit = 20,
      search,
      resolved
    } = req.query;

    const query = { course: req.params.courseId };

    if (resolved !== undefined) {
      query.isResolved = resolved === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const questions = await ForumQuestion.find(query)
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar role')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await ForumQuestion.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single question
// @route   GET /api/forum/:id
// @access  Public
exports.getQuestion = async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id)
      .populate('author', 'name avatar role bio')
      .populate('replies.author', 'name avatar role');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/forum/:id
// @access  Private
exports.updateQuestion = async (req, res) => {
  try {
    let question = await ForumQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }

    const { title, content, tags } = req.body;

    if (title) question.title = title;
    if (content) question.content = content;
    if (tags) question.tags = tags;

    await question.save();

    const updatedQuestion = await ForumQuestion.findById(question._id)
      .populate('author', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/forum/:id
// @access  Private
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add reply to question
// @route   POST /api/forum/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply content'
      });
    }

    const question = await ForumQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.isClosed) {
      return res.status(400).json({
        success: false,
        message: 'This question is closed for replies'
      });
    }

    question.replies.push({
      author: req.user.id,
      content
    });

    await question.save();

    const updatedQuestion = await ForumQuestion.findById(question._id)
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update reply
// @route   PUT /api/forum/:questionId/reply/:replyId
// @access  Private
exports.updateReply = async (req, res) => {
  try {
    const { content } = req.body;

    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const reply = question.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check ownership
    if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply'
      });
    }

    if (content) reply.content = content;

    await question.save();

    const updatedQuestion = await ForumQuestion.findById(question._id)
      .populate('replies.author', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Reply updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/forum/:questionId/reply/:replyId
// @access  Private
exports.deleteReply = async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const reply = question.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check ownership
    if (reply.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    reply.deleteOne();
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Accept reply as answer
// @route   PUT /api/forum/:questionId/reply/:replyId/accept
// @access  Private
exports.acceptReply = async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Only question author can accept answers
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    const reply = question.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Unaccept all other replies
    question.replies.forEach(r => r.isAccepted = false);

    // Accept this reply
    reply.isAccepted = true;
    question.isResolved = true;

    await question.save();

    const updatedQuestion = await ForumQuestion.findById(question._id)
      .populate('replies.author', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Reply accepted as answer',
      data: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Vote on question
// @route   POST /api/forum/:id/vote
// @access  Private
exports.voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'

    const question = await ForumQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const userId = req.user.id;

    // Remove previous votes
    question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
    question.downvotes = question.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      question.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      question.downvotes.push(userId);
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length
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

// @desc    Vote on reply
// @route   POST /api/forum/:questionId/reply/:replyId/vote
// @access  Private
exports.voteReply = async (req, res) => {
  try {
    const { voteType } = req.body;

    const question = await ForumQuestion.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const reply = question.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    const userId = req.user.id;

    // Remove previous votes
    reply.upvotes = reply.upvotes.filter(id => id.toString() !== userId);
    reply.downvotes = reply.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      reply.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      reply.downvotes.push(userId);
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        upvotes: reply.upvotes.length,
        downvotes: reply.downvotes.length
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
