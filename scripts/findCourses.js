const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import the Course model
const Course = require(path.resolve(__dirname, '../src/models/Course'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:SimpleMongoPassword123@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for finding courses...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Find all courses and display their information
const findCourses = async () => {
  try {
    console.log('Finding all courses...');
    
    // Find all courses
    const courses = await Course.find({});
    
    if (courses.length === 0) {
      console.log('No courses found in the database');
      return;
    }
    
    console.log(`Found ${courses.length} course(s):`);
    console.log('----------------------------------------');
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ID: ${course._id}`);
      console.log(`   Title: ${course.title}`);
      console.log(`   Creator ID: ${course.creator}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Difficulty: ${course.difficulty}`);
      console.log(`   Approval Status: ${course.approvalStatus}`);
      console.log(`   Published: ${course.isPublished}`);
      console.log('----------------------------------------');
    });
    
    // Also find courses by the admin user (admin@elearning.com)
    // First, find the admin user ID
    const User = require(path.resolve(__dirname, '../src/models/User'));
    const adminUser = await User.findOne({ email: 'admin@elearning.com' });
    
    if (adminUser) {
      console.log(`\nCourses created by admin (ID: ${adminUser._id}):`);
      const adminCourses = await Course.find({ creator: adminUser._id });
      
      if (adminCourses.length > 0) {
        adminCourses.forEach((course, index) => {
          console.log(`${index + 1}. ID: ${course._id}`);
          console.log(`   Title: ${course.title}`);
          console.log('----------------------------------------');
        });
      } else {
        console.log('No courses found created by admin user');
      }
    }
    
  } catch (error) {
    console.error('Error finding courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
connectDB().then(() => {
  findCourses();
});