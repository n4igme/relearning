const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import the User model
const User = require(path.resolve(__dirname, '../src/models/User'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:SimpleMongoPassword123@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for checking user...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check Lisa Anderson's user details
const checkUser = async () => {
  try {
    console.log('Checking user: lisa.anderson@elearning.com...');
    
    // Find the user by email
    const user = await User.findOne({ email: 'lisa.anderson@elearning.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User details:');
    console.log('ID:', user._id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Approval Status:', user.approvalStatus);
    console.log('Email Verified:', user.emailVerified);
    console.log('Is Active:', user.isActive);
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the script
connectDB().then(() => {
  checkUser();
});