const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import the User model
const User = require(path.resolve(__dirname, '../src/models/User'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:SimpleMongoPassword123@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for updating user...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update Lisa Anderson's user details
const updateUser = async () => {
  try {
    console.log('Updating user: lisa.anderson@elearning.com...');
    
    // Find the user by email
    const user = await User.findOne({ email: 'lisa.anderson@elearning.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Current user details:');
    console.log('ID:', user._id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Approval Status:', user.approvalStatus);
    console.log('Email Verified:', user.emailVerified);
    console.log('Is Active:', user.isActive);
    
    // Update approval status and email verification
    user.approvalStatus = 'approved';
    user.emailVerified = true;
    
    await user.save();
    
    console.log('\nUpdated user details:');
    console.log('Approval Status:', user.approvalStatus);
    console.log('Email Verified:', user.emailVerified);
    
    console.log('\nUser updated successfully!');
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the script
connectDB().then(() => {
  updateUser();
});