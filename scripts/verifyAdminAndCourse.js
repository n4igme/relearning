const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import the User model
const User = require(path.resolve(__dirname, '../src/models/User'));
const Course = require(path.resolve(__dirname, '../src/models/Course'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:SimpleMongoPassword123@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for user verification...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check admin user details and course details
const verifyAdminAndCourse = async () => {
  try {
    console.log('Checking admin user details...');
    
    // Find the admin user by email
    const adminUser = await User.findOne({ email: 'admin@elearning.com' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user details:');
    console.log('ID:', adminUser._id);
    console.log('Role:', adminUser.role);
    console.log('Approval Status:', adminUser.approvalStatus);
    console.log('Email Verified:', adminUser.emailVerified);
    console.log('Is Active:', adminUser.isActive);
    
    console.log('\nChecking course details...');
    
    // Find the specific course
    const course = await Course.findById('6938e5edc7984a3132b8a0da');
    
    if (!course) {
      console.log('Course not found in database');
      return;
    }
    
    console.log('Course details:');
    console.log('ID:', course._id);
    console.log('Title:', course.title);
    console.log('Creator ID:', course.creator);
    console.log('Approval Status:', course.approvalStatus);
    console.log('Is Published:', course.isPublished);
    console.log('Creator matches admin?', course.creator.toString() === adminUser._id.toString());
    
    // Check if admin user ID matches any mentor
    const hasMentor = course.mentors && course.mentors.some(mentor => mentor.toString() === adminUser._id.toString());
    console.log('Admin is mentor?', hasMentor);
    
  } catch (error) {
    console.error('Error checking admin and course:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
connectDB().then(() => {
  verifyAdminAndCourse();
});