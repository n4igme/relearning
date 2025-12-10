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
    console.log('MongoDB Connected for course access verification...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Simulate the exact access logic from getCourse function
const simulateAccessLogic = async () => {
  try {
    console.log('Simulating getCourse access control logic...\n');
    
    // Get the course
    const course = await Course.findById('6938e5edc7984a3132b8a0da');
    if (!course) {
      console.log('ERROR: Course not found in database!');
      return;
    }
    
    console.log('Course found:');
    console.log('- Title:', course.title);
    console.log('- Creator ID:', course.creator.toString());
    console.log('- Mentors:', course.mentors.map(m => m.toString()));
    console.log('- Approval Status:', course.approvalStatus);
    console.log('- Is Published:', course.isPublished);
    console.log('');
    
    // Get Lisa's user
    const lisa = await User.findOne({ email: 'lisa.anderson@elearning.com' });
    if (!lisa) {
      console.log('ERROR: Lisa Anderson user not found!');
      return;
    }
    
    console.log('Lisa Anderson found:');
    console.log('- ID:', lisa._id.toString());
    console.log('- Name:', lisa.name);
    console.log('- Role:', lisa.role);
    console.log('- Approval Status:', lisa.approvalStatus);
    console.log('');
    
    // Now simulate the exact same logic from getCourse function
    console.log('Simulating getCourse access control logic:');
    console.log('');
    
    // Check if the course is approved and published (for public access)
    console.log('1. Checking approval and publish status...');
    console.log('   course.approvalStatus !== "approved"?', course.approvalStatus !== 'approved');
    console.log('   !course.isPublished?', !course.isPublished);
    
    if (course.approvalStatus !== 'approved' || !course.isPublished) {
      console.log('   -> Course either not approved OR not published, so checking user authorization...');
      
      console.log('2. Checking if Lisa is authenticated...');
      if (lisa) { // req.user exists (Lisa is authenticated)
        console.log('   -> Lisa is authenticated, checking permissions...');
        
        console.log('3. Checking permission conditions...');
        const isAdmin = lisa.role === 'admin';
        const isCreator = course.creator.toString() === lisa._id.toString();
        const isMentor = course.mentors.some(mentor => mentor.toString() === lisa._id.toString());
        
        console.log('   -> isAdmin:', isAdmin);
        console.log('   -> isCreator:', isCreator);
        console.log('   -> isMentor:', isMentor);
        
        if (isAdmin) {
          console.log('   -> Lisa is admin: ACCESS GRANTED');
        } else if (isCreator) {
          console.log('   -> Lisa is creator: ACCESS GRANTED');
        } else if (isMentor) {
          console.log('   -> Lisa is mentor: ACCESS GRANTED');
        } else {
          console.log('   -> Lisa is not admin, creator, or mentor: ACCESS DENIED');
        }
        
        // This is the actual condition check from the code
        if (lisa.role !== 'admin' && course.creator.toString() !== lisa._id.toString() && !course.mentors.some(mentor => mentor.toString() === lisa._id.toString())) {
          console.log('\n   >>> FINAL RESULT: ACCESS DENIED - Lisa does NOT have permission as per the condition');
        } else {
          console.log('\n   >>> FINAL RESULT: ACCESS GRANTED - Lisa has permission');
        }
      } else {
        console.log('   -> Lisa is not authenticated: ACCESS DENIED');
      }
    } else {
      console.log('   -> Course is approved AND published: PUBLIC ACCESS GRANTED');
    }
    
  } catch (error) {
    console.error('Error simulating access logic:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the simulation
connectDB().then(() => {
  simulateAccessLogic();
});