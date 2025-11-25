const paymentService = require('../services/paymentService');
const Course = require('../models/Course');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.approvalStatus !== 'approved' || course.priceApprovalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      });
    }

    const paymentIntent = await paymentService.createPaymentIntent({
      amount: course.price.amount,
      currency: course.price.currency,
      courseId: course._id,
      studentId: req.user.id
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
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

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await paymentService.confirmPayment(paymentIntentId);

    // Enroll user in course
    if (!req.user.enrolledCourses.some(e => e.course.toString() === payment.course.toString())) {
      req.user.enrolledCourses.push({
        course: payment.course,
        enrolledAt: Date.now(),
        progress: 0,
        completed: false
      });
      await req.user.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(
        payment.course,
        { $inc: { enrollmentCount: 1 } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and enrolled successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Request refund
// @route   POST /api/payments/:id/refund
// @access  Private
exports.requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await paymentService.processRefund(req.params.id, reason);

    // Remove course enrollment
    req.user.enrolledCourses = req.user.enrolledCourses.filter(
      e => e.course.toString() !== payment.course.toString()
    );
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentDetails(req.params.id);

    // Check if user is authorized to view this payment
    if (payment.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await paymentService.handleWebhook(event);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`
    });
  }
};
