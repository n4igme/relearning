/**
 * Test Fixtures for E2E and Integration Tests
 *
 * Provides predefined test data for consistent test conditions.
 * Implements Requirement 21.4 (seed required test data before test execution).
 *
 * These fixtures are designed for E2E tests where we need consistent,
 * known test data that can be seeded into the database before test runs.
 */

import type { UserRole } from '@/types/database.types'

/**
 * Test user fixture type with credentials for E2E authentication
 */
export interface TestUserFixture {
  email: string
  password: string
  full_name: string
  role: UserRole
}

/**
 * Test course fixture type for seeding course data
 */
export interface TestCourseFixture {
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  is_published: boolean
  is_approved: boolean
  description?: string
}

/**
 * Test quest fixture type for seeding quiz data
 */
export interface TestQuestFixture {
  title: string
  passing_score: number
  max_attempts?: number
  questions: TestQuestionFixture[]
}

/**
 * Test question fixture type
 */
export interface TestQuestionFixture {
  question_text: string
  question_type: 'single_choice' | 'multiple_choice'
  points: number
  options: TestOptionFixture[]
}

/**
 * Test option fixture type
 */
export interface TestOptionFixture {
  option_text: string
  is_correct: boolean
}

/**
 * Predefined test users for E2E authentication tests
 *
 * These users should be seeded into the test database before E2E tests run.
 * Each user has a consistent email and password for reliable authentication.
 *
 * @example
 * // Login as student in E2E test
 * await page.fill('[name="email"]', testUsers.student.email)
 * await page.fill('[name="password"]', testUsers.student.password)
 */
export const testUsers: Record<string, TestUserFixture> = {
  student: {
    email: 'test-student@cybersec.academy',
    password: 'TestPassword123!',
    full_name: 'Test Student',
    role: 'student',
  },
  mentor: {
    email: 'test-mentor@cybersec.academy',
    password: 'TestPassword123!',
    full_name: 'Test Mentor',
    role: 'mentor',
  },
  admin: {
    email: 'test-admin@cybersec.academy',
    password: 'TestPassword123!',
    full_name: 'Test Admin',
    role: 'admin',
  },
}

/**
 * Predefined test courses for E2E course browsing and enrollment tests
 *
 * These courses should be seeded into the test database before E2E tests run.
 * Includes both free and paid courses to test different enrollment flows.
 *
 * @example
 * // Verify free course is displayed
 * await expect(page.getByText(testCourses.freeCourse.title)).toBeVisible()
 */
export const testCourses: Record<string, TestCourseFixture> = {
  freeCourse: {
    title: 'Introduction to Cybersecurity',
    difficulty: 'beginner',
    price: 0,
    is_published: true,
    is_approved: true,
    description: 'A free introductory course covering cybersecurity fundamentals.',
  },
  paidCourse: {
    title: 'Advanced Penetration Testing',
    difficulty: 'advanced',
    price: 99,
    is_published: true,
    is_approved: true,
    description: 'An advanced course on penetration testing techniques and methodologies.',
  },
  intermediateCourse: {
    title: 'Network Security Essentials',
    difficulty: 'intermediate',
    price: 49,
    is_published: true,
    is_approved: true,
    description: 'An intermediate course covering network security concepts and practices.',
  },
  draftCourse: {
    title: 'Upcoming Security Course',
    difficulty: 'beginner',
    price: 0,
    is_published: false,
    is_approved: false,
    description: 'A draft course not yet visible to students.',
  },
}

/**
 * Predefined test quests for E2E quiz taking tests
 *
 * These quests should be seeded into the test database before E2E tests run.
 * Includes quests with different configurations for testing various scenarios.
 *
 * @example
 * // Start a quiz in E2E test
 * await page.click(`text=${testQuests.basicQuiz.title}`)
 */
export const testQuests: Record<string, TestQuestFixture> = {
  basicQuiz: {
    title: 'Cybersecurity Basics Quiz',
    passing_score: 70,
    max_attempts: 3,
    questions: [
      {
        question_text: 'What does CIA stand for in cybersecurity?',
        question_type: 'single_choice',
        points: 10,
        options: [
          { option_text: 'Confidentiality, Integrity, Availability', is_correct: true },
          { option_text: 'Central Intelligence Agency', is_correct: false },
          { option_text: 'Computer Information Access', is_correct: false },
          { option_text: 'Cyber Intelligence Analysis', is_correct: false },
        ],
      },
      {
        question_text: 'Which of the following is a strong password?',
        question_type: 'single_choice',
        points: 10,
        options: [
          { option_text: 'password123', is_correct: false },
          { option_text: '12345678', is_correct: false },
          { option_text: 'P@ssw0rd!2024#Secure', is_correct: true },
          { option_text: 'qwerty', is_correct: false },
        ],
      },
      {
        question_text: 'What is phishing?',
        question_type: 'single_choice',
        points: 10,
        options: [
          { option_text: 'A type of fishing sport', is_correct: false },
          { option_text: 'A social engineering attack to steal credentials', is_correct: true },
          { option_text: 'A network protocol', is_correct: false },
          { option_text: 'A programming language', is_correct: false },
        ],
      },
    ],
  },
  advancedQuiz: {
    title: 'Advanced Penetration Testing Quiz',
    passing_score: 80,
    max_attempts: 2,
    questions: [
      {
        question_text: 'What is the purpose of a reverse shell?',
        question_type: 'single_choice',
        points: 20,
        options: [
          { option_text: 'To encrypt network traffic', is_correct: false },
          { option_text: 'To allow remote command execution from target to attacker', is_correct: true },
          { option_text: 'To scan for open ports', is_correct: false },
          { option_text: 'To create backups', is_correct: false },
        ],
      },
      {
        question_text: 'Which tool is commonly used for network packet analysis?',
        question_type: 'single_choice',
        points: 20,
        options: [
          { option_text: 'Microsoft Word', is_correct: false },
          { option_text: 'Wireshark', is_correct: true },
          { option_text: 'Notepad', is_correct: false },
          { option_text: 'Calculator', is_correct: false },
        ],
      },
      {
        question_text: 'What is SQL injection?',
        question_type: 'single_choice',
        points: 20,
        options: [
          { option_text: 'A database backup method', is_correct: false },
          { option_text: 'A code injection technique targeting databases', is_correct: true },
          { option_text: 'A type of encryption', is_correct: false },
          { option_text: 'A network protocol', is_correct: false },
        ],
      },
      {
        question_text: 'Which of the following are common vulnerability scanning tools?',
        question_type: 'multiple_choice',
        points: 20,
        options: [
          { option_text: 'Nessus', is_correct: true },
          { option_text: 'OpenVAS', is_correct: true },
          { option_text: 'Microsoft Paint', is_correct: false },
          { option_text: 'Qualys', is_correct: true },
        ],
      },
    ],
  },
  unlimitedAttemptsQuiz: {
    title: 'Practice Quiz - Unlimited Attempts',
    passing_score: 60,
    // No max_attempts means unlimited
    questions: [
      {
        question_text: 'What is encryption?',
        question_type: 'single_choice',
        points: 10,
        options: [
          { option_text: 'Converting data into a coded format', is_correct: true },
          { option_text: 'Deleting files permanently', is_correct: false },
          { option_text: 'Compressing files', is_correct: false },
          { option_text: 'Copying files', is_correct: false },
        ],
      },
      {
        question_text: 'What is a firewall?',
        question_type: 'single_choice',
        points: 10,
        options: [
          { option_text: 'A physical wall that prevents fire', is_correct: false },
          { option_text: 'A network security device that monitors traffic', is_correct: true },
          { option_text: 'A type of virus', is_correct: false },
          { option_text: 'A backup system', is_correct: false },
        ],
      },
    ],
  },
}

/**
 * Helper function to get total points for a quest
 *
 * @param quest - The test quest fixture
 * @returns Total possible points for the quest
 */
export const getQuestTotalPoints = (quest: TestQuestFixture): number => {
  return quest.questions.reduce((total, q) => total + q.points, 0)
}

/**
 * Helper function to get correct answers for a quest
 * Returns an array of correct option indices for each question
 *
 * @param quest - The test quest fixture
 * @returns Array of correct option indices (or arrays for multiple choice)
 */
export const getCorrectAnswers = (quest: TestQuestFixture): (number | number[])[] => {
  return quest.questions.map((question) => {
    if (question.question_type === 'multiple_choice') {
      return question.options
        .map((opt, idx) => (opt.is_correct ? idx : -1))
        .filter((idx) => idx !== -1)
    }
    return question.options.findIndex((opt) => opt.is_correct)
  })
}

/**
 * Helper function to calculate expected score for given answers
 *
 * @param quest - The test quest fixture
 * @param answers - Array of selected option indices (or arrays for multiple choice)
 * @returns Expected score percentage
 */
export const calculateExpectedScore = (
  quest: TestQuestFixture,
  answers: (number | number[])[]
): number => {
  const totalPoints = getQuestTotalPoints(quest)
  let earnedPoints = 0

  quest.questions.forEach((question, qIndex) => {
    const answer = answers[qIndex]
    if (question.question_type === 'multiple_choice') {
      // For multiple choice, check if all correct options are selected
      const correctIndices = question.options
        .map((opt, idx) => (opt.is_correct ? idx : -1))
        .filter((idx) => idx !== -1)
      const selectedIndices = Array.isArray(answer) ? answer : [answer]
      const isCorrect =
        correctIndices.length === selectedIndices.length &&
        correctIndices.every((idx) => selectedIndices.includes(idx))
      if (isCorrect) {
        earnedPoints += question.points
      }
    } else {
      // For single choice, check if the selected option is correct
      const selectedIndex = typeof answer === 'number' ? answer : answer[0]
      if (question.options[selectedIndex]?.is_correct) {
        earnedPoints += question.points
      }
    }
  })

  return Math.round((earnedPoints / totalPoints) * 100)
}
