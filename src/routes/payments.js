const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  requestRefund,
  getPayment,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Webhook must be before other routes and without body parser
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/:id/refund', protect, requestRefund);
router.get('/:id', protect, getPayment);

module.exports = router;
