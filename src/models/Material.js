const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide material type'],
    enum: ['video', 'pdf', 'text', 'quiz', 'resource'],
    default: 'text'
  },
  content: {
    type: String,
    default: null
  },
  filePath: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
materialSchema.index({ course: 1, order: 1 });
materialSchema.index({ course: 1, type: 1 });

module.exports = mongoose.model('Material', materialSchema);