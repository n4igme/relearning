const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (data) => {
  const { amount, currency, courseId, studentId } = data;

  try {
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      metadata: {
        courseId: courseId.toString(),
        studentId: studentId.toString()
      }
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

exports.confirmPayment = async (paymentIntentId) => {
  try {
    // Retrieve the payment intent to get details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed successfully');
    }

    // Get course and student IDs from metadata
    const courseId = paymentIntent.metadata.courseId;
    const studentId = paymentIntent.metadata.studentId;

    // Create payment record
    const payment = await Payment.create({
      student: studentId,
      course: courseId,
      amount: paymentIntent.amount / 100, // Convert back from cents
      currency: paymentIntent.currency,
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntent.id,
      status: 'completed',
      metadata: {
        paymentIntentId: paymentIntent.id
      }
    });

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      paymentStatus: 'completed',
      paymentAmount: paymentIntent.amount / 100,
      transactionId: payment.transactionId
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    return {
      payment,
      enrollment
    };
  } catch (error) {
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
};

exports.processRefund = async (paymentId, reason) => {
  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Cannot refund a payment that is not completed');
    }

    // In real implementation, you would call Stripe to process the refund
    // const refund = await stripe.refunds.create({
    //   payment_intent: payment.stripePaymentIntentId
    // });

    // Update payment status
    payment.status = 'refunded';
    payment.refundDetails = {
      refundedAt: new Date(),
      reason: reason,
      amount: payment.amount
    };
    await payment.save();

    return payment;
  } catch (error) {
    throw new Error(`Failed to process refund: ${error.message}`);
  }
};

exports.getPaymentDetails = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId)
      .populate('student', 'name email')
      .populate('course', 'title description');

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  } catch (error) {
    throw new Error(`Failed to get payment details: ${error.message}`);
  }
};

exports.handleWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update payment status in our database
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: 'completed' }
        );
        
        console.log('Payment succeeded for:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        
        // Update payment status in our database
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: failedPaymentIntent.id },
          { status: 'failed' }
        );
        
        console.log('Payment failed for:', failedPaymentIntent.id);
        break;

      case 'charge.refunded':
        const charge = event.data.object;
        
        // Update payment status to refunded
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: charge.payment_intent },
          { 
            status: 'refunded',
            refundDetails: {
              refundedAt: new Date(),
              reason: charge.refunds.data[0].reason || 'Refund processed',
              amount: charge.refunds.data[0].amount / 100
            }
          }
        );
        
        console.log('Payment refunded:', charge.payment_intent);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    throw error;
  }
};

// Midtrans Mock Implementation
exports.createMidtransPayment = async (data) => {
  const { amount, courseId, studentId } = data;

  try {
    // In a real implementation, you would call the Midtrans API
    // For this demo, we'll create a mock transaction
    const mockTransactionId = `MIDTRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      transaction_id: mockTransactionId,
      gross_amount: amount,
      payment_url: 'https://example.com/mock-payment-page', // This would be the real redirect URL
      token: 'mock_token_for_demo'
    };
  } catch (error) {
    throw new Error(`Failed to create Midtrans payment: ${error.message}`);
  }
};

// Process Midtrans webhook
exports.handleMidtransWebhook = async (notification) => {
  try {
    const { order_id, transaction_status, fraud_status } = notification;

    // Find payment by transaction ID (order_id)
    const payment = await Payment.findOne({ transactionId: order_id });

    if (!payment) {
      console.log('Payment not found for order_id:', order_id);
      return;
    }

    // Update payment status based on transaction_status
    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        if (fraud_status === 'accept') {
          payment.status = 'completed';
        } else {
          payment.status = 'failed';
        }
        break;
      case 'pending':
        payment.status = 'pending';
        break;
      case 'cancel':
      case 'deny':
      case 'expire':
        payment.status = 'failed';
        break;
      default:
        console.log(`Unknown transaction status: ${transaction_status}`);
        return;
    }

    await payment.save();
    console.log(`Payment ${order_id} updated to status: ${payment.status}`);
  } catch (error) {
    console.error('Midtrans webhook handler error:', error);
    throw error;
  }
};