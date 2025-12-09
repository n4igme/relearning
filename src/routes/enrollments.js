const express = require('express');
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrollment,
  initiatePayment,
  confirmPayment,
  getPaymentHistory,
  initiateMidtrans,
  getStudentCourses
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.use(protect);

router.route('/')
  .post(enrollInCourse)
  .get(getMyEnrollments);

router.route('/my-courses')
  .get(getStudentCourses);

router.route('/:id')
  .get(getEnrollment);

router.route('/:id/initiate-payment')
  .post(initiatePayment);

router.route('/:id/confirm-payment')
  .post(confirmPayment);

router.route('/payments')
  .get(getPaymentHistory);

// Midtrans payment route
router.route('/:id/initiate-midtrans')
  .post(initiateMidtrans);

module.exports = router;