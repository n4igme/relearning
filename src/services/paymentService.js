const Payment = require('../models/Payment');
const Course = require('../models/Course');

/**
 * Create mock payment intent
 * @param {Object} paymentData - Payment information
 * @returns {Object} Payment intent
 */
exports.createPaymentIntent = async (paymentData) => {
  try {
    const { amount, currency, courseId, studentId } = paymentData;

    // Mock Stripe payment intent creation
    const mockPaymentIntent = {
      id: `pi_mock_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_mock_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      status: 'requires_confirmation',
      metadata: {
        courseId,
        studentId
      }
    };

    return mockPaymentIntent;
  } catch (error) {
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};

/**
 * Confirm payment and create payment record
 * @param {String} paymentIntentId - Mock payment intent ID
 * @returns {Object} Payment record
 */
exports.confirmPayment = async (paymentIntentId) => {
  try {
    // In a real app, we would retrieve the payment intent from Stripe
    // For mock purposes, we'll extract the course and student IDs from the DB based on payment intent ID
    // If no payment record exists, we'll create a new one from the payment intent ID
    
    // First, check if a payment record with this intent ID already exists (created during intent creation)
    let payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    
    if (payment) {
      // Payment record already exists, just update status
      payment.status = 'completed';
      await payment.save();
    } else {
      // Create a new payment record since this is the first confirmation
      // We need to extract the course and student ID from the context
      // For demo purposes, we'll use mock values but in a real system these would come from the intent metadata
      const mockPaymentIntent = {
        id: paymentIntentId,
        amount: 4999, // Default amount (49.99 * 100)
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          courseId: '69109b248ce9954272ee4221', // Default course ID for demo
          studentId: '6910b3db95502b22a4a28713'  // Default student ID for demo
        }
      };

      if (mockPaymentIntent.status === 'succeeded') {
        payment = await Payment.create({
          student: mockPaymentIntent.metadata.studentId,
          course: mockPaymentIntent.metadata.courseId,
          amount: mockPaymentIntent.amount / 100, // Convert from cents
          currency: mockPaymentIntent.currency.toUpperCase(),
          stripePaymentIntentId: mockPaymentIntent.id,
          status: 'completed',
          paymentMethod: 'stripe'
        });
      } else {
        throw new Error('Payment not successful');
      }
    }

    return payment;
  } catch (error) {
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

/**
 * Process refund
 * @param {String} paymentId - Payment ID
 * @param {String} reason - Refund reason
 * @returns {Object} Updated payment record
 */
exports.processRefund = async (paymentId, reason) => {
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Payment is not eligible for refund');
    }

    // Mock Stripe refund
    const mockRefund = {
      amount: payment.amount * 100, // Convert to cents
      payment_intent: payment.stripePaymentIntentId
    };

    // Update payment record
    payment.status = 'refunded';
    payment.refundDetails = {
      refundedAt: Date.now(),
      reason: reason || 'requested_by_customer',
      amount: mockRefund.amount / 100
    };

    await payment.save();

    return payment;
  } catch (error) {
    throw new Error(`Refund processing failed: ${error.message}`);
  }
};

/**
 * Get payment details
 * @param {String} paymentId - Payment ID
 * @returns {Object} Payment details
 */
exports.getPaymentDetails = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate('student', 'name email')
      .populate('course', 'title');

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  } catch (error) {
    throw new Error(`Failed to get payment details: ${error.message}`);
  }
};

/**
 * Mock webhook handler (does nothing in mock mode)
 * @param {Object} event - Stripe event
 */
exports.handleWebhook = async (event) => {
  try {
    // In mock mode, we don't process actual webhooks
    // In a real application, this would process the event and update the database accordingly
    switch (event.type) {
      case 'payment_intent.succeeded':
        // In a real app, this would confirm the payment
        console.log('Mock webhook: payment_intent.succeeded');
        break;

      case 'payment_intent.payment_failed':
        // In a real app, this would mark the payment as failed
        console.log('Mock webhook: payment_intent.payment_failed');
        break;

      case 'charge.refunded':
        // In a real app, this would process the refund
        console.log('Mock webhook: charge.refunded');
        break;

      default:
        console.log(`Mock webhook: unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Mock webhook handling error:', error);
    throw error;
  }
};
