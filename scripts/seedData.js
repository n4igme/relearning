const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const User = require(path.resolve(__dirname, '../src/models/User'));
const Course = require(path.resolve(__dirname, '../src/models/Course'));
const Quest = require(path.resolve(__dirname, '../src/models/Quest'));
const Certificate = require(path.resolve(__dirname, '../src/models/Certificate'));
const ForumQuestion = require(path.resolve(__dirname, '../src/models/Forum'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:changeme_secure_password@localhost:27017/elearning?authSource=admin');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Quest.deleteMany({});
    await Certificate.deleteMany({});
    await ForumQuestion.deleteMany({});

    // Create Admin Users
    console.log('Creating admin users...');
    const admin1 = await User.create({
      name: 'John Administrator',
      email: 'admin@elearning.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    // Create Mentor Users
    console.log('Creating mentor users...');
    const mentor1 = await User.create({
      name: 'Dr. Emily Roberts',
      email: 'emily.roberts@elearning.com',
      password: 'mentor123',
      role: 'mentor',
      isActive: true,
      bio: 'Expert in Web Development with 10+ years of experience.',
      expertise: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    });

    const mentor2 = await User.create({
      name: 'Prof. Michael Chen',
      email: 'michael.chen@elearning.com',
      password: 'mentor123',
      role: 'mentor',
      isActive: true,
      bio: 'Data Science professional specializing in ML and AI.',
      expertise: ['Python', 'Machine Learning', 'Data Analysis'],
    });

    const mentor3 = await User.create({
      name: 'Dr. Lisa Anderson',
      email: 'lisa.anderson@elearning.com',
      password: 'mentor123',
      role: 'mentor',
      isActive: true,
      bio: 'Mobile app development expert.',
      expertise: ['React Native', 'Flutter', 'iOS', 'Android'],
    });

    // Create Student Users
    console.log('Creating student users...');
    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@student.com',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    const student2 = await User.create({
      name: 'Maria Garcia',
      email: 'maria.garcia@student.com',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    const student3 = await User.create({
      name: 'David Kim',
      email: 'david.kim@student.com',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    const student4 = await User.create({
      name: 'Emma Wilson',
      email: 'emma.wilson@student.com',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    // Create Courses
    console.log('Creating courses...');
    const course1 = await Course.create({
      title: 'Full-Stack Web Development Bootcamp',
      description: 'Comprehensive course covering frontend and backend web development with modern technologies including React, Node.js, and MongoDB.',
      creator: mentor1._id,
      mentors: [mentor1._id],
      category: 'programming',
      difficulty: 'intermediate',
      price: {
        amount: 299.99,
        currency: 'USD',
        proposedBy: mentor1._id
      },
      priceApprovalStatus: 'approved',
      approvalStatus: 'approved',
      approvedBy: admin1._id,
      approvedAt: new Date('2024-01-01'),
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      materials: [
        {
          title: 'Course Modules',
          order: 1,
          subMaterials: [
            {
              title: 'Introduction to Web Development',
              type: 'video',
              content: 'Overview of web technologies and development environment setup',
              duration: 120,
              order: 1,
            },
            {
              title: 'HTML & CSS Fundamentals',
              type: 'video',
              content: 'Learn the building blocks of web pages',
              duration: 180,
              order: 2,
            },
            {
              title: 'JavaScript Essentials',
              type: 'video',
              content: 'Master JavaScript programming',
              duration: 240,
              order: 3,
            },
            {
              title: 'React.js for Frontend',
              type: 'video',
              content: 'Build modern user interfaces',
              duration: 300,
              order: 4,
            },
            {
              title: 'Node.js & Express Backend',
              type: 'video',
              content: 'Create RESTful APIs',
              duration: 280,
              order: 5,
            },
            {
              title: 'MongoDB Database',
              type: 'article',
              content: 'Working with NoSQL databases',
              duration: 200,
              order: 6,
            },
          ],
        },
      ],
      enrollmentCount: 3,
      isPublished: true,
      tags: ['web development', 'javascript', 'react', 'nodejs', 'full-stack']
    });

    const course2 = await Course.create({
      title: 'Machine Learning with Python',
      description: 'Learn machine learning algorithms and build intelligent applications using Python and popular ML libraries.',
      creator: mentor2._id,
      mentors: [mentor2._id],
      category: 'data-science',
      difficulty: 'advanced',
      price: {
        amount: 399.99,
        currency: 'USD',
        proposedBy: mentor2._id
      },
      priceApprovalStatus: 'approved',
      approvalStatus: 'approved',
      approvedBy: admin1._id,
      approvedAt: new Date('2024-01-10'),
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
      materials: [
        {
          title: 'Course Modules',
          order: 1,
          subMaterials: [
            {
              title: 'Introduction to Machine Learning',
              type: 'video',
              content: 'Understanding ML concepts and types',
              duration: 150,
              order: 1,
            },
            {
              title: 'Python for Data Science',
              type: 'video',
              content: 'NumPy, Pandas, and Matplotlib',
              duration: 200,
              order: 2,
            },
            {
              title: 'Supervised Learning',
              type: 'video',
              content: 'Regression and classification',
              duration: 250,
              order: 3,
            },
            {
              title: 'Deep Learning Basics',
              type: 'video',
              content: 'Neural networks with TensorFlow',
              duration: 300,
              order: 4,
            },
          ],
        },
      ],
      enrollmentCount: 2,
      isPublished: true,
      tags: ['machine learning', 'python', 'data science', 'ai']
    });

    const course3 = await Course.create({
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile applications for iOS and Android using React Native.',
      creator: mentor3._id,
      mentors: [mentor3._id],
      category: 'programming',
      difficulty: 'intermediate',
      price: {
        amount: 249.99,
        currency: 'USD',
        proposedBy: mentor3._id
      },
      priceApprovalStatus: 'approved',
      approvalStatus: 'approved',
      approvedBy: admin1._id,
      approvedAt: new Date('2024-01-20'),
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
      materials: [
        {
          title: 'Course Modules',
          order: 1,
          subMaterials: [
            {
              title: 'Introduction to React Native',
              type: 'video',
              content: 'Setup and basic concepts',
              duration: 120,
              order: 1,
            },
            {
              title: 'React Native Components',
              type: 'video',
              content: 'Building UI with components',
              duration: 180,
              order: 2,
            },
            {
              title: 'Navigation & Routing',
              type: 'video',
              content: 'React Navigation',
              duration: 150,
              order: 3,
            },
            {
              title: 'State Management',
              type: 'video',
              content: 'Redux and Context API',
              duration: 200,
              order: 4,
            },
          ],
        },
      ],
      enrollmentCount: 2,
      isPublished: true,
      tags: ['react native', 'mobile', 'ios', 'android', 'cross-platform']
    });

    // Enroll Students in Courses
    console.log('Enrolling students in courses...');
    student1.enrolledCourses.push({ course: course1._id });
    student2.enrolledCourses.push({ course: course1._id });
    student2.enrolledCourses.push({ course: course2._id });
    student3.enrolledCourses.push({ course: course3._id });
    student4.enrolledCourses.push({ course: course2._id });
    student4.enrolledCourses.push({ course: course3._id });

    await student1.save();
    await student2.save();
    await student3.save();
    await student4.save();

    // Create Quests
    console.log('Creating quests...');
    const quest1 = await Quest.create({
      course: course1._id,
      creator: mentor1._id,
      title: 'JavaScript Fundamentals Quiz',
      description: 'Test your knowledge of JavaScript basics.',
      questions: [
        {
          question: 'What is a closure in JavaScript?',
          type: 'multiple-choice',
          options: [
            { text: 'A function with access to parent scope', isCorrect: true },
            { text: 'A way to close a program', isCorrect: false },
            { text: 'A loop structure', isCorrect: false },
            { text: 'A type of variable', isCorrect: false }
          ],
          points: 10,
          explanation: 'A closure is a function that has access to variables in its parent scope.'
        },
        {
          question: 'Which method adds an element to the end of an array?',
          type: 'multiple-choice',
          options: [
            { text: 'push()', isCorrect: true },
            { text: 'pop()', isCorrect: false },
            { text: 'shift()', isCorrect: false },
            { text: 'unshift()', isCorrect: false }
          ],
          points: 10
        }
      ],
      passingScore: 70,
      timeLimit: 30,
      approvalStatus: 'approved',
      approvedBy: admin1._id,
      approvedAt: new Date('2024-01-15'),
      attempts: [
        {
          student: student1._id,
          score: 100,
          passed: true,
          startedAt: new Date('2024-02-15T10:00:00'),
          completedAt: new Date('2024-02-15T10:15:00'),
          timeTaken: 15
        },
        {
          student: student2._id,
          score: 85,
          passed: true,
          startedAt: new Date('2024-02-18T14:00:00'),
          completedAt: new Date('2024-02-18T14:12:00'),
          timeTaken: 12
        }
      ]
    });

    const quest2 = await Quest.create({
      course: course1._id,
      creator: mentor1._id,
      title: 'React Hooks Quiz',
      description: 'Test your knowledge of React Hooks.',
      questions: [
        {
          question: 'Which hook is used for side effects?',
          type: 'multiple-choice',
          options: [
            { text: 'useState', isCorrect: false },
            { text: 'useEffect', isCorrect: true },
            { text: 'useContext', isCorrect: false },
            { text: 'useRef', isCorrect: false }
          ],
          points: 10
        }
      ],
      passingScore: 70,
      timeLimit: 20,
      approvalStatus: 'approved',
      approvedBy: admin1._id,
      approvedAt: new Date('2024-01-20'),
    });

    const quest3 = await Quest.create({
      course: course2._id,
      creator: mentor2._id,
      title: 'Machine Learning Concepts Quiz',
      description: 'Test your ML fundamentals.',
      questions: [
        {
          question: 'What is overfitting?',
          type: 'multiple-choice',
          options: [
            { text: 'Model performs well on training but poorly on test data', isCorrect: true },
            { text: 'Model performs poorly on both', isCorrect: false },
            { text: 'Model trains too quickly', isCorrect: false }
          ],
          points: 10
        },
        {
          question: 'Is supervised learning used when you have labeled data?',
          type: 'true-false',
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false }
          ],
          points: 10
        }
      ],
      passingScore: 70,
      timeLimit: 30,
      approvalStatus: 'approved',
      approvedBy: admin1._id,
      approvedAt: new Date('2024-01-25'),
      attempts: [
        {
          student: student2._id,
          score: 95,
          passed: true,
          startedAt: new Date('2024-02-25T09:00:00'),
          completedAt: new Date('2024-02-25T09:20:00'),
          timeTaken: 20
        }
      ]
    });

    // Create Certificates
    console.log('Creating certificates...');
    const cert1 = await Certificate.create({
      student: student1._id,
      course: course1._id,
      quest: quest1._id,
      certificateNumber: 'CERT-WD-2024-001',
      issueDate: new Date('2024-03-01'),
      completionDate: new Date('2024-02-28'),
      score: 95,
      grade: 'A+',
    });

    const cert2 = await Certificate.create({
      student: student2._id,
      course: course2._id,
      quest: quest3._id,
      certificateNumber: 'CERT-ML-2024-001',
      issueDate: new Date('2024-03-10'),
      completionDate: new Date('2024-03-08'),
      score: 92,
      grade: 'A',
    });

    // Create Forum Posts (Q&A)
    console.log('Creating forum posts (Q&A)...');
    const forum1 = await ForumQuestion.create({
      course: course1._id,
      author: student1._id,
      title: 'How to handle authentication in MERN stack?',
      content: 'I am building a MERN application and confused about authentication. Should I use JWT or sessions?',
      tags: ['authentication', 'jwt', 'security', 'mern'],
      replies: [
        {
          author: mentor1._id,
          content: 'Great question! For MERN stack, JWT is recommended. Here\'s why:\n\n1. Stateless - no server-side session storage\n2. Scalable - works well with microservices\n3. Mobile-friendly\n\nBasic implementation:\n```javascript\nconst jwt = require(\'jsonwebtoken\');\nconst token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: \'7d\' });\n```\n\nSecurity tips:\n- Always use HTTPS\n- Store tokens in httpOnly cookies\n- Implement refresh tokens\n- Set appropriate expiration',
          createdAt: new Date('2024-02-11T10:30:00'),
          upvotes: [student2._id, student3._id],
          isAccepted: true,
        },
        {
          author: student2._id,
          content: 'Thanks! Where should we store JWT on client side?',
          createdAt: new Date('2024-02-11T14:20:00'),
        },
        {
          author: mentor1._id,
          content: 'Good question! Options:\n\n1. httpOnly Cookies (Most secure)\n2. LocalStorage (Easy but vulnerable to XSS)\n3. SessionStorage\n\nI recommend httpOnly cookies for web apps.',
          createdAt: new Date('2024-02-11T15:00:00'),
          upvotes: [student1._id, student2._id],
        },
      ],
      upvotes: [student2._id, student3._id, student4._id],
    });

    const forum2 = await ForumQuestion.create({
      course: course1._id,
      author: student3._id,
      title: 'Error: Cannot read property \'map\' of undefined in React',
      content: 'Getting this error when rendering a list:\n\n```\nCannot read property \'map\' of undefined\n```\n\nMy code:\n```javascript\nconst [items, setItems] = useState();\nreturn items.map(item => <div>{item.name}</div>);\n```\n\nWhat\'s wrong?',
      tags: ['react', 'javascript', 'error', 'debugging'],
      replies: [
        {
          author: student1._id,
          content: 'Initialize as empty array:\n\n```javascript\nconst [items, setItems] = useState([]);\n```\n\nOr add conditional:\n```javascript\n{items && items.map(item => <div>{item.name}</div>)}\n```',
          createdAt: new Date('2024-02-13T09:15:00'),
          upvotes: [student3._id, mentor1._id],
          isAccepted: true,
        },
        {
          author: mentor1._id,
          content: 'Exactly! Always initialize state with appropriate type. For arrays use `[]`, for objects `{}`.',
          createdAt: new Date('2024-02-13T09:30:00'),
          upvotes: [student1._id, student3._id],
        },
      ],
      upvotes: [student1._id],
    });

    const forum3 = await ForumQuestion.create({
      course: course2._id,
      author: student4._id,
      title: 'Difference between supervised and unsupervised learning?',
      content: 'Confused about the fundamental difference. Can someone explain with examples?',
      tags: ['machine-learning', 'concepts', 'fundamentals'],
      replies: [
        {
          author: mentor2._id,
          content: 'Great question!\n\n**Supervised Learning:**\n- Labeled data (input + output)\n- Learn to map inputs to outputs\n- Examples: Classification, Regression\n- Use cases: Spam detection, price prediction\n\n**Unsupervised Learning:**\n- Unlabeled data (input only)\n- Find patterns in data\n- Examples: Clustering, Dimensionality reduction\n- Use cases: Customer segmentation, anomaly detection\n\n**Simple analogy:**\n- Supervised: Learning with a teacher\n- Unsupervised: Finding patterns yourself',
          createdAt: new Date('2024-02-16T11:00:00'),
          upvotes: [student4._id, student2._id],
          isAccepted: true,
        },
      ],
      upvotes: [student2._id],
    });

    const forum4 = await ForumQuestion.create({
      course: course3._id,
      author: student1._id,
      title: 'Tip: Use React DevTools with React Native',
      content: 'You can use React DevTools to debug React Native apps!\n\nSetup:\n1. `npm install -g react-devtools`\n2. Run: `react-devtools`\n3. Start your app\n\nDevTools will auto-connect. Great for inspecting component tree!',
      tags: ['react-native', 'debugging', 'tools', 'tips'],
      replies: [
        {
          author: mentor3._id,
          content: 'Great tip! Other tools I recommend:\n\n1. Flipper - Facebook\'s debugging platform\n2. Reactotron - Desktop app for inspecting\n3. React Native Debugger\n\nEach has strengths for different debugging needs.',
          createdAt: new Date('2024-02-24T09:00:00'),
          upvotes: [student1._id],
        },
      ],
      upvotes: [mentor3._id],
    });

    console.log('\n✅ Sample data created successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('\nADMIN:');
    console.log('Email: admin@elearning.com');
    console.log('Password: admin123');
    console.log('\nMENTORS:');
    console.log('Email: emily.roberts@elearning.com | Password: mentor123');
    console.log('Email: michael.chen@elearning.com | Password: mentor123');
    console.log('Email: lisa.anderson@elearning.com | Password: mentor123');
    console.log('\nSTUDENTS:');
    console.log('Email: alex.johnson@student.com | Password: student123');
    console.log('Email: maria.garcia@student.com | Password: student123');
    console.log('Email: david.kim@student.com | Password: student123');
    console.log('Email: emma.wilson@student.com | Password: student123');
    console.log('\n=== SUMMARY ===');
    console.log(`Admins: 1`);
    console.log(`Mentors: 3`);
    console.log(`Students: 4`);
    console.log(`Courses: 3`);
    console.log(`Quests: 3`);
    console.log(`Certificates: 2`);
    console.log(`Forum Posts (Q&A): 4`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the seeder
connectDB().then(() => {
  seedData();
});
