const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models with error handling
console.log('Attempting to import models...');
let User, Course, Quest, Certificate, ForumQuestion;
try {
  User = require(path.resolve(__dirname, '../src/models/User'));
  Course = require(path.resolve(__dirname, '../src/models/Course'));
  Quest = require(path.resolve(__dirname, '../src/models/Quest'));
  Certificate = require(path.resolve(__dirname, '../src/models/Certificate'));
  ForumQuestion = require(path.resolve(__dirname, '../src/models/Forum'));
  console.log('All models imported successfully');
} catch (err) {
  console.error('Error importing models:', err.message);
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:changeme_secure_password@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Quest.deleteMany({});
    await Certificate.deleteMany({});
    await ForumQuestion.deleteMany({});

    // Create Admin Users
    console.log('Creating admin users...');
    const admin1 = await User.create({
      name: 'John Administrator',
      email: 'admin@elearning.com',
      password: 'admin123',
      approvalStatus: 'approved',
      role: 'admin',
      isActive: true,
      emailVerified: true,  // Set email as verified for admin
    });
    console.log('Admin user created successfully:', admin1.email, 'with emailVerified:', admin1.emailVerified);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the seeder
connectDB().then(() => {
  seedData();
});
