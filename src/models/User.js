const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'mentor', 'student'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0 // Percentage (0-100) based on completed materials
    },
    completed: {
      type: Boolean,
      default: false // True when both materials are 100% complete AND quest is passed
    },
    materialsCompleted: [{
      // Track which materials (bab/sub-bab) have been completed
      materialId: {
        type: mongoose.Schema.Types.ObjectId
      },
      subMaterialId: {
        type: mongoose.Schema.Types.ObjectId
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }],
    materialsProgress: {
      // Calculated field: percentage of materials completed
      type: Number,
      default: 0
    },
    questAttempted: {
      type: Boolean,
      default: false
    },
    questPassed: {
      type: Boolean,
      default: false
    }
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  certifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Field for admin approval system
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Field for email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
