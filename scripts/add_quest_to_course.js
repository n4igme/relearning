/**
 * Script to add a quest to the existing JavaScript Programming Fundamentals course
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('./src/models/Course');
const User = require('./src/models/User');
const Quest = require('./src/models/Quest');

const addQuestToExistingCourse = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(
      process.env.MONGODB_URI || 
      'mongodb://admin:ReLe%40rN1ng_M0ng0_D8_P%40ssw0rd_2025!@localhost:27017/elearning?authSource=admin'
    );
    
    console.log('Finding the JavaScript Programming Fundamentals course...');
    const course = await Course.findOne({ title: 'JavaScript Programming Fundamentals' });
    
    if (!course) {
      console.error('Course not found!');
      return;
    }
    
    console.log(`Found course: ${course.title} (ID: ${course._id})`);
    
    // Find the mentor user we created
    const mentorUser = await User.findOne({ email: 'mentor@example.com' });
    
    if (!mentorUser) {
      console.error('Mentor user not found!');
      return;
    }
    
    console.log(`Found mentor: ${mentorUser.name} (${mentorUser.email})`);
    
    // Update the course to have this mentor as the creator/mentor
    course.creator = mentorUser._id;
    if (!course.mentors.includes(mentorUser._id)) {
      course.mentors.push(mentorUser._id);
    }
    await course.save();
    
    console.log('Updated course creator to the mentor user');
    
    // Check if a quest already exists for this course
    const existingQuest = await Quest.findOne({ course: course._id });
    
    if (existingQuest) {
      console.log('A quest already exists for this course, skipping creation...');
      console.log(`Quest ID: ${existingQuest._id}, Title: ${existingQuest.title}`);
      return;
    }
    
    console.log('Creating a sample quest for the course...');
    
    // Create a quest for the course
    const quest = await Quest.create({
      title: 'JavaScript Fundamentals Assessment',
      description: 'Test your knowledge of JavaScript fundamentals covered in the course',
      course: course._id,
      creator: mentorUser._id,
      questions: [
        {
          question: 'What is the correct way to declare a constant variable in JavaScript?',
          type: 'multiple-choice',
          options: [
            { text: 'var myConstant', isCorrect: false },
            { text: 'let myConstant', isCorrect: false },
            { text: 'const myConstant', isCorrect: true },
            { text: 'constant myConstant', isCorrect: false }
          ],
          points: 10
        },
        {
          question: 'Which of the following is NOT a JavaScript primitive data type?',
          type: 'multiple-choice',
          options: [
            { text: 'String', isCorrect: false },
            { text: 'Number', isCorrect: false },
            { text: 'Array', isCorrect: true },
            { text: 'Boolean', isCorrect: false }
          ],
          points: 10
        },
        {
          question: 'Arrow functions in JavaScript are best used when...',
          type: 'short-answer',
          correctAnswer: 'you don\'t need the function to have its own "this" context',
          points: 15
        }
      ],
      passingScore: 70,
      approvalStatus: 'approved',
      approvedBy: mentorUser._id,
      approvedAt: new Date(),
      isActive: true
    });
    
    console.log('✓ Quest created successfully:');
    console.log(`  - Title: ${quest.title}`);
    console.log(`  - Questions: ${quest.questions.length}`);
    console.log(`  - Passing Score: ${quest.passingScore}%`);
    console.log(`  - Quest ID: ${quest._id}`);
    
    // Link the quest to the course
    if (!course.quests.includes(quest._id)) {
      course.quests.push(quest._id);
      await course.save();
      console.log('✓ Quest linked to course');
    }
    
    console.log('\n✅ Quest successfully added to the course!');
    console.log('The learning progression flow is now complete:');
    console.log('  1. Course with bab/sub-bab structure exists');
    console.log('  2. Students can enroll in the course');
    console.log('  3. Students can progress through materials');
    console.log('  4. Quest is available for the course');
    console.log('  5. Certificate will be issued upon successful quest completion');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error adding quest:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    throw error;
  }
};

addQuestToExistingCourse();