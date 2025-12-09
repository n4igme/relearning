const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
progressSchema.index({ enrollment: 1, material: 1 });
progressSchema.index({ user: 1, material: 1 });

module.exports = mongoose.model('Progress', progressSchema);