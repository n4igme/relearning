const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const User = require(path.resolve(__dirname, '../src/models/User'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://admin:changeme_secure_password@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for updating users...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update users to ensure they are active and email verified
const updateUserStatus = async () => {
  try {
    console.log('Updating user status to ensure they are active and email verified...');
    
    // Update all existing users to have emailVerified = true and isActive = true
    const result = await User.updateMany(
      {},
      { 
        $set: { 
          emailVerified: true,
          isActive: true,
          approvalStatus: 'approved'
        } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} users to be active and email verified.`);
    
    // Verify a few specific accounts exist
    const admin = await User.findOne({ email: 'admin@elearning.com' });
    if (admin) {
      console.log('✅ Admin account exists and status updated');
      console.log('Email Verified:', admin.emailVerified);
      console.log('Is Active:', admin.isActive);
      console.log('Approval Status:', admin.approvalStatus);
    } else {
      console.log('❌ Admin account not found');
    }
    
    const student = await User.findOne({ email: 'alex.johnson@student.com' });
    if (student) {
      console.log('✅ Student account exists and status updated');
      console.log('Email Verified:', student.emailVerified);
      console.log('Is Active:', student.isActive);
      console.log('Approval Status:', student.approvalStatus);
    } else {
      console.log('❌ Student account not found');
    }
    
  } catch (error) {
    console.error('Error updating user status:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the update
connectDB().then(() => {
  updateUserStatus();
});