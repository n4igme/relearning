const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Stripe = require('stripe');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is approved and published
    if (course.approvalStatus !== 'approved' || !course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Determine the price to use (original or admin approved)
    let finalPrice = course.price.amount;
    if (course.adminApprovedPrice && course.adminApprovedPrice.amount !== undefined) {
      finalPrice = course.adminApprovedPrice.amount;
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paymentStatus: 'pending',
      paymentAmount: finalPrice,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    res.status(201).json({
      success: true,
      data: {
        enrollment,
        message: 'Enrollment created successfully. Please complete payment to access course.'
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

// @desc    Get student's enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private/Student
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        select: 'title description thumbnail category difficulty price creator mentors approvalStatus isPublished'
      })
      .populate({
        path: 'student',
        select: 'name email'
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private/Student (own enrollment) or Mentor/Admin
exports.getEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course', 'title description thumbnail')
      .populate('student', 'name email');

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
          message: 'Not authorized to access this enrollment'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Initiate payment for enrollment
// @route   POST /api/enrollments/:id/initiate-payment
// @access  Private/Student
exports.initiatePayment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if this belongs to the current user
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to initiate payment for this enrollment'
      });
    }

    // Check if payment is already completed
    if (enrollment.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this enrollment'
      });
    }

    try {
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(enrollment.paymentAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          enrollmentId: enrollment._id.toString(),
          userId: req.user.id,
          courseId: enrollment.course.toString()
        }
      });

      // Update enrollment payment status to pending
      enrollment.paymentStatus = 'pending';
      await enrollment.save();

      res.status(200).json({
        success: true,
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount: enrollment.paymentAmount,
          currency: 'usd'
        }
      });
    } catch (stripeError) {
      res.status(500).json({
        success: false,
        message: 'Payment initiation failed',
        error: stripeError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Confirm payment for enrollment
// @route   POST /api/enrollments/:id/confirm-payment
// @access  Private/Student
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if this belongs to the current user
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm payment for this enrollment'
      });
    }

    try {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update enrollment
        enrollment.paymentStatus = 'completed';
        await enrollment.save();

        // Update course enrollment count
        await Course.findByIdAndUpdate(enrollment.course, {
          $inc: { enrollmentCount: 1 }
        });

        // Create payment record
        await Payment.create({
          student: enrollment.student,
          course: enrollment.course,
          amount: enrollment.paymentAmount,
          currency: 'usd',
          paymentMethod: 'stripe',
          stripePaymentIntentId: paymentIntent.id,
          status: 'completed',
          transactionId: enrollment.transactionId,
          metadata: {
            enrollmentId: enrollment._id.toString()
          }
        });

        res.status(200).json({
          success: true,
          data: enrollment,
          message: 'Payment confirmed successfully. You now have access to the course.'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment not completed successfully'
        });
      }
    } catch (stripeError) {
      res.status(500).json({
        success: false,
        message: 'Payment confirmation failed',
        error: stripeError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's payment history
// @route   GET /api/enrollments/payments
// @access  Private/Student
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('course', 'title description')
      .populate('student', 'name email')
      .sort({ paymentDate: -1 });

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

// Midtrans Mock Implementation (as backup to Stripe)
// @desc    Initiate Midtrans payment for enrollment
// @route   POST /api/enrollments/:id/initiate-midtrans
// @access  Private/Student
exports.initiateMidtrans = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if this belongs to the current user
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to initiate payment for this enrollment'
      });
    }

    // Check if payment is already completed
    if (enrollment.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this enrollment'
      });
    }

    // Mock Midtrans response (in actual implementation, you'd call Midtrans API)
    const mockTransactionId = `MIDTRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Update enrollment payment status to pending
    enrollment.paymentStatus = 'pending';
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        transaction_id: mockTransactionId,
        token: 'mock_token_for_demo',
        amount: enrollment.paymentAmount,
        currency: 'usd',
        payment_url: 'https://example.com/mock-payment-page' // Mock URL
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

// @desc    Student enrollment routes (get my courses)
// @route   GET /api/student/courses
// @access  Private/Student
exports.getStudentCourses = async (req, res, next) => {
  try {
    // This is an alias for getMyEnrollments
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        select: 'title description thumbnail category difficulty approvalStatus isPublished'
      })
      .populate({
        path: 'student',
        select: 'name email'
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};