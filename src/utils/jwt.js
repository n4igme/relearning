const jwt = require('jsonwebtoken');

// Generate JWT access token
exports.generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'simple_jwt_secret_for_dev';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '15m' // Short-lived access token
  });
};

// Generate JWT refresh token
exports.generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'simple_refresh_secret_for_dev';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Send token response with both access and refresh tokens
exports.sendTokenResponse = (user, statusCode, res) => {
  const accessToken = this.generateToken(user._id);
  const refreshToken = this.generateRefreshToken(user._id);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict'
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      emailVerified: user.emailVerified
    }
  });
};

// Verify refresh token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
