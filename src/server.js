const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const security = require('./middleware/security');
const { limiter, authLimiter } = require('./middleware/rateLimit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Apply security middleware first
app.use(security);

// Apply general rate limiting to all requests
app.use(limiter);

// CORS
app.use(cors());

// Cookie parser middleware
app.use(cookieParser());

// Body parser (except for webhook route)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth')); // More restrictive for auth
app.use('/api/admin', require('./routes/admin'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/student', require('./routes/student'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/certificates', require('./routes/certificates'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'eLearning API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      courses: '/api/courses',
      quests: '/api/quests',
      student: '/api/student',
      forum: '/api/forum',
      payments: '/api/payments'
    }
  });
});

// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
