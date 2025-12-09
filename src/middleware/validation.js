const { body, query, param } = require('express-validator');

// User validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['student', 'mentor', 'admin'])
      .withMessage('Role must be student, mentor, or admin')
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .exists()
      .withMessage('Password is required')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],

  resetPassword: [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters')
  ]
};

// Course validation rules
const courseValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('category')
      .isIn(['programming', 'design', 'business', 'marketing', 'data-science', 'other'])
      .withMessage('Please provide a valid category'),
    body('price.amount')
      .isNumeric()
      .withMessage('Price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Price cannot be negative');
        }
        return true;
      })
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('category')
      .optional()
      .isIn(['programming', 'design', 'business', 'marketing', 'data-science', 'other'])
      .withMessage('Please provide a valid category'),
    body('price.amount')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Price cannot be negative');
        }
        return true;
      })
  ],

  approve: [
    body('rejectionReason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Rejection reason must be less than 500 characters')
  ]
};

// Material validation rules
const materialValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
    body('type')
      .isIn(['video', 'pdf', 'text', 'quiz', 'resource'])
      .withMessage('Material type must be video, pdf, text, quiz, or resource'),
    body('order')
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty'),
    body('type')
      .optional()
      .isIn(['video', 'pdf', 'text', 'quiz', 'resource'])
      .withMessage('Material type must be video, pdf, text, quiz, or resource'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
  ]
};

// Quest validation rules
const questValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('course')
      .isMongoId()
      .withMessage('Valid course ID is required'),
    body('questions')
      .isArray({ min: 1 })
      .withMessage('At least one question is required'),
    body('passingScore')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Passing score must be a number between 0 and 100')
  ],

  submit: [
    body('answers')
      .isArray({ min: 1 })
      .withMessage('At least one answer is required'),
    body('answers.*.questionId')
      .isMongoId()
      .withMessage('Valid question ID is required'),
    body('answers.*.answer')
      .exists()
      .withMessage('Answer is required')
  ],

  approve: [
    body('rejectionReason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Rejection reason must be less than 500 characters')
  ]
};

// Enrollment validation rules
const enrollmentValidation = {
  enroll: [
    body('courseId')
      .isMongoId()
      .withMessage('Valid course ID is required')
  ],

  initiatePayment: [
    body('paymentIntentId')
      .notEmpty()
      .withMessage('Payment intent ID is required')
  ]
};

// Certificate validation rules
const certificateValidation = {
  generate: [
    body('courseId')
      .isMongoId()
      .withMessage('Valid course ID is required'),
    body('questId')
      .isMongoId()
      .withMessage('Valid quest ID is required'),
    body('score')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Score must be between 0 and 100')
  ],

  verify: [
    param('number')
      .notEmpty()
      .withMessage('Certificate number is required')
  ]
};

// Forum validation rules
const forumValidation = {
  createQuestion: [
    body('title')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Title must be between 10 and 200 characters'),
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long'),
    body('courseId')
      .isMongoId()
      .withMessage('Valid course ID is required'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],

  addReply: [
    body('content')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Reply must be at least 5 characters long')
  ],

  vote: [
    body('voteType')
      .isIn(['upvote', 'downvote'])
      .withMessage('Vote type must be upvote or downvote')
  ]
};

module.exports = {
  userValidation,
  courseValidation,
  materialValidation,
  questValidation,
  enrollmentValidation,
  certificateValidation,
  forumValidation
};