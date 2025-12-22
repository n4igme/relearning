# Sequelize Quick Start Guide

## ✅ What You've Done So Far

1. ✅ Created Supabase account
2. ✅ Created PostgreSQL schema (19 tables)
3. ✅ Installed Sequelize
4. ✅ Updated `src/config/database.js`
5. ✅ Created `src/models/User.js` (Sequelize version)
6. ✅ Created `src/models/index.js` (model loader)

---

## 🚀 Next Steps (2-3 Days)

### Step 1: Create Remaining Models

I've created the User model as an example. You need to create 17 more models following the same pattern.

**Pattern to follow:**

```javascript
// src/models/ModelName.js
module.exports = (sequelize, DataTypes) => {
  const ModelName = sequelize.define('ModelName', {
    // Define fields matching your PostgreSQL schema
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    field_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'field_name' // Maps to snake_case in database
    }
    // ... more fields
  }, {
    tableName: 'table_name', // Exact table name in PostgreSQL
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  ModelName.associate = (models) => {
    // ModelName.hasMany(models.OtherModel, { foreignKey: 'model_id' });
    // ModelName.belongsTo(models.OtherModel, { foreignKey: 'other_id' });
  };

  return ModelName;
};
```

---

### Models You Need to Create

Based on your PostgreSQL schema, create these files:

1. ✅ `User.js` - Already done!
2. ⏳ `Course.js`
3. ⏳ `CourseMentor.js`
4. ⏳ `Material.js`
5. ⏳ `SubMaterial.js`
6. ⏳ `Enrollment.js`
7. ⏳ `Progress.js`
8. ⏳ `Quest.js`
9. ⏳ `QuestQuestion.js`
10. ⏳ `QuestQuestionOption.js`
11. ⏳ `QuestAttempt.js`
12. ⏳ `QuestAttemptAnswer.js`
13. ⏳ `Certificate.js`
14. ⏳ `Payment.js`
15. ⏳ `ForumQuestion.js`
16. ⏳ `ForumReply.js`
17. ⏳ `ForumVote.js`
18. ⏳ `Review.js`

---

## 💡 FASTER APPROACH: Use AI to Convert

Since you're working with AI, here's the fastest way:

**For EACH existing Mongoose model:**

1. Open the old Mongoose model file
2. Copy the entire content
3. Ask me: "Convert this Mongoose model to Sequelize following the User.js pattern"
4. I'll give you the complete Sequelize version
5. Paste it into the file

**Example:**
```
You: "Here's my Course.js Mongoose model: [paste code]. Convert it to Sequelize."
Me: [Gives you complete Sequelize version]
You: Paste into Course.js
```

This way you'll have all 18 models done in 1-2 hours instead of days!

---

## 🧪 Step 2: Test Database Connection

After creating models, test the connection:

```bash
# Create test file
node src/test-db.js
```

Create `src/test-db.js`:
```javascript
const { sequelize } = require('./config/database');
const { connectDB } = require('./config/database');

async function testConnection() {
  try {
    await connectDB();

    // Test a simple query
    const [results] = await sequelize.query('SELECT NOW()');
    console.log('✓ Database time:', results[0].now);

    // Count tables
    const [tables] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('✓ Total tables:', tables[0].count);

    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run test:
```bash
node src/test-db.js
```

Expected output:
```
✓ PostgreSQL connected successfully
✓ Database synced
✓ Database time: 2025-12-22T...
✓ Total tables: 19
```

---

## 📝 Step 3: Create Seed Data

Create `src/seeders/seedData.js`:
```javascript
const { sequelize, User, Course } = require('../models');
const { connectDB } = require('../config/database');

async function seed() {
  try {
    await connectDB();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@elearning.com',
      password_hash: 'admin123', // Will be auto-hashed
      role: 'admin',
      email_verified: true,
      approval_status: 'approved'
    });
    console.log('✓ Created admin:', admin.email);

    // Create mentor
    const mentor = await User.create({
      name: 'John Mentor',
      email: 'mentor@elearning.com',
      password_hash: 'mentor123',
      role: 'mentor',
      email_verified: true,
      approval_status: 'approved'
    });
    console.log('✓ Created mentor:', mentor.email);

    // Create student
    const student = await User.create({
      name: 'Jane Student',
      email: 'student@elearning.com',
      password_hash: 'student123',
      role: 'student',
      email_verified: true,
      approval_status: 'approved'
    });
    console.log('✓ Created student:', student.email);

    // Create sample course
    const course = await Course.create({
      creator_id: mentor.id,
      title: 'Introduction to Node.js',
      description: 'Learn Node.js from scratch',
      category: 'programming',
      difficulty: 'beginner',
      price_amount: 49.99,
      is_published: true,
      approval_status: 'approved'
    });
    console.log('✓ Created course:', course.title);

    console.log('\n✅ Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

seed();
```

Run seed:
```bash
node src/seeders/seedData.js
```

---

## 🔧 Step 4: Update server.js

Update `src/server.js` to use new database connection:

**Find this line:**
```javascript
const connectDB = require('./config/database');
// ...
connectDB();
```

**Replace with:**
```javascript
const { connectDB } = require('./config/database');
// ...
connectDB();
```

---

## ✅ Testing Checklist

After creating all models:

- [ ] All 18 model files created
- [ ] No syntax errors in models
- [ ] `node src/test-db.js` runs successfully
- [ ] Seed data created successfully
- [ ] Can query users: `SELECT * FROM users;` in Supabase
- [ ] Server starts without errors: `npm run dev`

---

## 🆘 Common Issues

### Issue 1: "Cannot find module 'sequelize'"
```bash
Solution: npm install sequelize pg pg-hstore
```

### Issue 2: "relation 'users' does not exist"
```bash
Solution: Your schema wasn't created. Go to Supabase SQL Editor and run postgresql-schema.sql again
```

### Issue 3: "password authentication failed"
```bash
Solution: Check your .env file - POSTGRES_URI has correct password
```

### Issue 4: "SSL connection required"
```bash
Solution: Add to .env:
NODE_ENV=production

Or update database.js dialectOptions
```

---

## 🚀 Ready for Next Model?

**Want me to convert your next model?**

Tell me:
1. Which model you want to convert next (Course, Quest, etc.)
2. Or paste the Mongoose model code and I'll convert it!

**Or, if you want all models at once:**
Say: "Give me all 17 remaining Sequelize models" and I'll provide them in batches.

---

## 📊 Progress Tracker

Use this to track your progress:

**Models Converted:**
- [x] User.js
- [ ] Course.js
- [ ] CourseMentor.js
- [ ] Material.js
- [ ] SubMaterial.js
- [ ] Enrollment.js
- [ ] Progress.js
- [ ] Quest.js
- [ ] QuestQuestion.js
- [ ] QuestQuestionOption.js
- [ ] QuestAttempt.js
- [ ] QuestAttemptAnswer.js
- [ ] Certificate.js
- [ ] Payment.js
- [ ] ForumQuestion.js
- [ ] ForumReply.js
- [ ] ForumVote.js
- [ ] Review.js

**Time Estimate:**
- With AI help: 2-4 hours
- Manual: 2-3 days

**Let me know which model you want next, or ask for all at once!** 🚀
