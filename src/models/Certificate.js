const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true
  },
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'Pass'],
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  verificationUrl: {
    type: String
  },
  isValid: {
    type: Boolean,
    default: true
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokeReason: {
    type: String
  }
}, {
  timestamps: true
});

// Generate certificate number
certificateSchema.pre('save', function(next) {
  if (!this.certificateNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.certificateNumber = `CERT-${year}-${random}`;
  }
  next();
});

// Calculate grade based on score
certificateSchema.pre('save', function(next) {
  if (this.score >= 95) this.grade = 'A+';
  else if (this.score >= 90) this.grade = 'A';
  else if (this.score >= 85) this.grade = 'B+';
  else if (this.score >= 80) this.grade = 'B';
  else if (this.score >= 75) this.grade = 'C+';
  else if (this.score >= 70) this.grade = 'C';
  else this.grade = 'Pass';

  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
