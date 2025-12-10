const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import the User and Course models
const User = require(path.resolve(__dirname, '../src/models/User'));
const Course = require(path.resolve(__dirname, '../src/models/Course'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:SimpleMongoPassword123@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for course verification...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check the specific course and Lisa's access
const checkCourseAndAccess = async () => {
  try {
    console.log('Checking course ID: 6938e5edc7984a3132b8a0da...');
    
    // Find the course
    const course = await Course.findById('6938e5edc7984a3132b8a0da');
    
    if (!course) {
      console.log('Course not found');
      return;
    }
    
    console.log('Course details:');
    console.log('ID:', course._id);
    console.log('Title:', course.title);
    console.log('Creator ID:', course.creator);
    console.log('Creator Mentors:', course.mentors);
    console.log('Approval Status:', course.approvalStatus);
    console.log('Is Published:', course.isPublished);
    console.log('Price Approval Status:', course.priceApprovalStatus);
    
    // Find Lisa Anderson's user ID
    const lisa = await User.findOne({ email: 'lisa.anderson@elearning.com' });
    
    if (!lisa) {
      console.log('Lisa Anderson user not found');
      return;
    }
    
    console.log('\nLisa Anderson details:');
    console.log('ID:', lisa._id);
    console.log('Name:', lisa.name);
    console.log('Role:', lisa.role);
    console.log('Approval Status:', lisa.approvalStatus);
    
    // Check if Lisa is the creator or one of the mentors for this course
    const isCreator = course.creator.toString() === lisa._id.toString();
    const isMentor = course.mentors && course.mentors.some(mentor => mentor.toString() === lisa._id.toString());
    
    console.log('\nAccess Check:');
    console.log('Is Lisa the creator?', isCreator);
    console.log('Is Lisa a mentor for this course?', isMentor);
    
    if (isCreator || isMentor) {
      console.log('\nLisa SHOULD have access to this course');
    } else {
      console.log('\nLisa does NOT have access to this course');
      console.log('The course creator/mentors are different from Lisa');
    }
    
  } catch (error) {
    console.error('Error checking course and access:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
connectDB().then(() => {
  checkCourseAndAccess();
});