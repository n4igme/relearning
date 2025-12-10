const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import the User model
const User = require(path.resolve(__dirname, '../src/models/User'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:SimpleMongoPassword123@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for updating admin approval...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update admin user approval status
const updateUserStatus = async () => {
  try {
    console.log('Updating admin user approval status...');
    
    // Find the admin user by email
    const user = await User.findOne({ email: 'admin@elearning.com' });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found user:', user.email, 'Role:', user.role, 'Approval Status:', user.approvalStatus, 'isActive:', user.isActive);
    
    // Update approval status to approved
    user.approvalStatus = 'approved';
    user.emailVerified = true;
    await user.save();

    console.log('Admin user approval status and email verification updated');
    console.log('Updated user:', user.email, 'Role:', user.role, 'Approval Status:', user.approvalStatus, 'Email Verified:', user.emailVerified, 'isActive:', user.isActive);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the script
connectDB().then(() => {
  updateUserStatus();
});