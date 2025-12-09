const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
