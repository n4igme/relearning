const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['programming', 'design', 'business', 'marketing', 'data-science', 'other']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: {
    type: String,
    default: null
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  materials: [{
    // Bab (Chapter)
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    order: {
      type: Number,
      required: true
    },
    subMaterials: [{
      // Sub-Bab (Sub-Chapter)
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
      },
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['video', 'article', 'resource'],
        required: true
      },
      content: {
        type: String
      },
      url: {
        type: String
      },
      duration: {
        type: Number // in minutes
      },
      order: {
        type: Number,
        required: true
      }
    }]
  }],
  // Legacy content field for backwards compatibility
  content: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['video', 'article', 'quiz', 'resource'],
      required: true
    },
    url: String,
    content: String,
    duration: Number, // in minutes
    order: Number
  }],
  price: {
    amount: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  priceApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  quests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
