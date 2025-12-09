const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
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
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  questAttempted: {
    type: Boolean,
    default: false
  },
  questPassed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);