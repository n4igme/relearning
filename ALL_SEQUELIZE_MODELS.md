# All Remaining Sequelize Models

Copy each model below into its corresponding file in `src/models/`

---

## Progress.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    enrollment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'enrollments',
        key: 'id'
      }
    },
    sub_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sub_materials',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE
    },
    watched_duration: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'progress',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['enrollment_id', 'sub_material_id']
      }
    ]
  });

  Progress.associate = (models) => {
    Progress.belongsTo(models.Enrollment, {
      foreignKey: 'enrollment_id',
      as: 'enrollment'
    });

    Progress.belongsTo(models.SubMaterial, {
      foreignKey: 'sub_material_id',
      as: 'subMaterial'
    });

    Progress.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Progress;
};
```

---

## Quest.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const Quest = sequelize.define('Quest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    passing_score: {
      type: DataTypes.INTEGER,
      defaultValue: 70
    },
    time_limit: {
      type: DataTypes.INTEGER
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    approval_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    },
    approved_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE
    },
    rejection_reason: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'quests',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Quest.associate = (models) => {
    Quest.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });

    Quest.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator'
    });

    Quest.hasMany(models.QuestQuestion, {
      foreignKey: 'quest_id',
      as: 'questions'
    });

    Quest.hasMany(models.QuestAttempt, {
      foreignKey: 'quest_id',
      as: 'attempts'
    });
  };

  return Quest;
};
```

---

## QuestQuestion.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const QuestQuestion = sequelize.define('QuestQuestion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quest_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quests',
        key: 'id'
      }
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['multiple-choice', 'true-false', 'short-answer']]
      }
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    explanation: {
      type: DataTypes.TEXT
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'quest_questions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  QuestQuestion.associate = (models) => {
    QuestQuestion.belongsTo(models.Quest, {
      foreignKey: 'quest_id',
      as: 'quest'
    });

    QuestQuestion.hasMany(models.QuestQuestionOption, {
      foreignKey: 'question_id',
      as: 'options'
    });
  };

  return QuestQuestion;
};
```

---

## QuestQuestionOption.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const QuestQuestionOption = sequelize.define('QuestQuestionOption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quest_questions',
        key: 'id'
      }
    },
    option_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'quest_question_options',
    underscored: true,
    timestamps: false
  });

  QuestQuestionOption.associate = (models) => {
    QuestQuestionOption.belongsTo(models.QuestQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });
  };

  return QuestQuestionOption;
};
```

---

## QuestAttempt.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const QuestAttempt = sequelize.define('QuestAttempt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quest_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quests',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    enrollment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'enrollments',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    time_taken: {
      type: DataTypes.INTEGER
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'quest_attempts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  QuestAttempt.associate = (models) => {
    QuestAttempt.belongsTo(models.Quest, {
      foreignKey: 'quest_id',
      as: 'quest'
    });

    QuestAttempt.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });

    QuestAttempt.belongsTo(models.Enrollment, {
      foreignKey: 'enrollment_id',
      as: 'enrollment'
    });

    QuestAttempt.hasMany(models.QuestAttemptAnswer, {
      foreignKey: 'attempt_id',
      as: 'answers'
    });
  };

  return QuestAttempt;
};
```

---

## QuestAttemptAnswer.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const QuestAttemptAnswer = sequelize.define('QuestAttemptAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quest_attempts',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quest_questions',
        key: 'id'
      }
    },
    selected_option_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'quest_question_options',
        key: 'id'
      }
    },
    answer_text: {
      type: DataTypes.TEXT
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'quest_attempt_answers',
    underscored: true,
    timestamps: false
  });

  QuestAttemptAnswer.associate = (models) => {
    QuestAttemptAnswer.belongsTo(models.QuestAttempt, {
      foreignKey: 'attempt_id',
      as: 'attempt'
    });

    QuestAttemptAnswer.belongsTo(models.QuestQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });

    QuestAttemptAnswer.belongsTo(models.QuestQuestionOption, {
      foreignKey: 'selected_option_id',
      as: 'selectedOption'
    });
  };

  return QuestAttemptAnswer;
};
```

---

## Certificate.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    quest_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'quests',
        key: 'id'
      }
    },
    certificate_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    issued_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completion_date: {
      type: DataTypes.DATE
    },
    verification_url: {
      type: DataTypes.TEXT
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    revoked_at: {
      type: DataTypes.DATE
    },
    revoked_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    revoke_reason: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'certificates',
    underscored: true,
    timestamps: false
  });

  // Generate certificate number before create
  Certificate.beforeCreate(async (certificate) => {
    if (!certificate.certificate_number) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000000);
      certificate.certificate_number = `CERT-${year}-${random}`;
    }

    // Calculate grade based on score
    if (certificate.score >= 95) certificate.grade = 'A+';
    else if (certificate.score >= 90) certificate.grade = 'A';
    else if (certificate.score >= 85) certificate.grade = 'B+';
    else if (certificate.score >= 80) certificate.grade = 'B';
    else if (certificate.score >= 75) certificate.grade = 'C+';
    else if (certificate.score >= 70) certificate.grade = 'C';
    else certificate.grade = 'Pass';
  });

  Certificate.associate = (models) => {
    Certificate.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });

    Certificate.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });

    Certificate.belongsTo(models.Quest, {
      foreignKey: 'quest_id',
      as: 'quest'
    });
  };

  return Certificate;
};
```

---

## Payment.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    enrollment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'enrollments',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['stripe', 'paypal', 'midtrans', 'bank-transfer']]
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['pending', 'completed', 'failed', 'refunded']]
      }
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255)
    },
    refunded_at: {
      type: DataTypes.DATE
    },
    refund_reason: {
      type: DataTypes.TEXT
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'payments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // Generate transaction ID before create
  Payment.beforeCreate(async (payment) => {
    if (!payment.transaction_id) {
      payment.transaction_id = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });

    Payment.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });

    Payment.belongsTo(models.Enrollment, {
      foreignKey: 'enrollment_id',
      as: 'enrollment'
    });
  };

  return Payment;
};
```

---

## ForumQuestion.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const ForumQuestion = sequelize.define('ForumQuestion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    is_resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'forum_questions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ForumQuestion.associate = (models) => {
    ForumQuestion.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });

    ForumQuestion.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author'
    });

    ForumQuestion.hasMany(models.ForumReply, {
      foreignKey: 'question_id',
      as: 'replies'
    });

    ForumQuestion.hasMany(models.ForumVote, {
      foreignKey: 'question_id',
      as: 'votes'
    });
  };

  return ForumQuestion;
};
```

---

## ForumReply.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const ForumReply = sequelize.define('ForumReply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forum_questions',
        key: 'id'
      }
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    parent_reply_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'forum_replies',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'forum_replies',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ForumReply.associate = (models) => {
    ForumReply.belongsTo(models.ForumQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });

    ForumReply.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author'
    });

    ForumReply.belongsTo(models.ForumReply, {
      foreignKey: 'parent_reply_id',
      as: 'parentReply'
    });

    ForumReply.hasMany(models.ForumReply, {
      foreignKey: 'parent_reply_id',
      as: 'childReplies'
    });

    ForumReply.hasMany(models.ForumVote, {
      foreignKey: 'reply_id',
      as: 'votes'
    });
  };

  return ForumReply;
};
```

---

## ForumVote.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const ForumVote = sequelize.define('ForumVote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'forum_questions',
        key: 'id'
      }
    },
    reply_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'forum_replies',
        key: 'id'
      }
    },
    vote_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['upvote', 'downvote']]
      }
    }
  }, {
    tableName: 'forum_votes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'question_id', 'reply_id']
      }
    ],
    validate: {
      eitherQuestionOrReply() {
        if ((this.question_id && this.reply_id) || (!this.question_id && !this.reply_id)) {
          throw new Error('Vote must be for either a question or a reply, not both');
        }
      }
    }
  });

  ForumVote.associate = (models) => {
    ForumVote.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    ForumVote.belongsTo(models.ForumQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });

    ForumVote.belongsTo(models.ForumReply, {
      foreignKey: 'reply_id',
      as: 'reply'
    });
  };

  return ForumVote;
};
```

---

## Review.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    review_text: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['course_id', 'student_id']
      }
    ]
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });

    Review.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });
  };

  return Review;
};
```

---

# ✅ Done!

All 18 Sequelize models are now ready!

## Next Steps:

1. Copy each model code above into its respective file
2. Run `node src/test-db.js` to test connection
3. Create seed data
4. Test your backend!
