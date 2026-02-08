/**
 * Database Test Helper
 *
 * Provides utilities for database setup, teardown, seeding, and cleanup
 * in integration tests. Implements Requirements 21.2 (cleanup) and 21.5 (parallel isolation).
 *
 * This helper uses unique test identifiers to ensure tests can run in parallel
 * without data conflicts. Each test run gets isolated data that is cleaned up
 * after the test completes.
 *
 * @example
 * // In a test file
 * import { testDatabaseHelper } from 'test-utils/helpers/db'
 *
 * beforeAll(async () => {
 *   await testDatabaseHelper.setup()
 * })
 *
 * afterAll(async () => {
 *   await testDatabaseHelper.teardown()
 * })
 *
 * beforeEach(async () => {
 *   await testDatabaseHelper.clean()
 * })
 */

import {
  mockData,
  setMockData,
  resetMocks as resetSupabaseMocks,
} from '../../__mocks__/supabase'
import type { TestData, TestDatabaseHelper } from './types'

/**
 * Generate a unique test run identifier
 * Used to isolate test data across parallel test runs
 *
 * @returns Unique identifier string
 */
function generateTestRunId(): string {
  return `test-run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Current test run identifier
 * Set during setup and used to prefix all test data
 */
let currentTestRunId: string | null = null

/**
 * Track tables that have been seeded for cleanup
 */
const seededTables: Set<string> = new Set()

/**
 * Set up the test database
 *
 * Initializes the test environment with a unique test run ID
 * to ensure isolation from other parallel test runs.
 *
 * Implements Requirement 21.5 (parallel test isolation)
 */
async function setup(): Promise<void> {
  // Generate unique test run ID for isolation
  currentTestRunId = generateTestRunId()

  // Reset all mock data to start fresh
  resetSupabaseMocks()

  // Clear tracked tables
  seededTables.clear()

  // Initialize empty arrays for common tables
  const tables = [
    'profiles',
    'courses',
    'materials',
    'sub_materials',
    'enrollments',
    'progress',
    'quests',
    'quest_questions',
    'quest_options',
    'quest_attempts',
    'payments',
    'certificates',
    'badges',
    'student_badges',
    'leaderboard_stats',
    'skills',
    'student_skills',
  ]

  tables.forEach((table) => {
    if (!mockData[table]) {
      mockData[table] = []
    }
  })
}

/**
 * Tear down the test database
 *
 * Cleans up all test data and resets the test environment.
 * Should be called in afterAll() hook.
 *
 * Implements Requirement 21.2 (cleanup after test run)
 */
async function teardown(): Promise<void> {
  // Clean all test data
  await clean()

  // Reset the test run ID
  currentTestRunId = null

  // Reset all Supabase mocks
  resetSupabaseMocks()

  // Clear tracked tables
  seededTables.clear()
}

/**
 * Seed the database with test data
 *
 * Inserts test data into the mock database with unique identifiers
 * prefixed by the current test run ID to ensure isolation.
 *
 * @param data - Test data to seed
 *
 * Implements Requirements 21.3 (unique identifiers) and 21.5 (parallel isolation)
 *
 * @example
 * await testDatabaseHelper.seed({
 *   users: [{ id: 'user-1', email: 'test@example.com', ... }],
 *   courses: [{ id: 'course-1', title: 'Test Course', ... }],
 * })
 */
async function seed(data: TestData): Promise<void> {
  const prefix = currentTestRunId || 'test'

  // Seed users/profiles
  if (data.users && data.users.length > 0) {
    const profiles = data.users.map((user) => ({
      id: user.id.startsWith(prefix) ? user.id : `${prefix}-${user.id}`,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: null,
      bio: null,
      is_approved: user.is_approved ?? true,
      is_active: user.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    setMockData('profiles', [...(mockData['profiles'] || []), ...profiles])
    seededTables.add('profiles')
  }

  // Seed courses
  if (data.courses && data.courses.length > 0) {
    const courses = data.courses.map((course) => ({
      id: course.id.startsWith(prefix) ? course.id : `${prefix}-${course.id}`,
      title: course.title,
      slug: course.slug,
      description: null,
      short_description: null,
      thumbnail_url: null,
      category: 'cybersecurity',
      difficulty: course.difficulty,
      price: course.price,
      currency: 'USD',
      is_published: course.is_published ?? false,
      is_approved: course.is_approved ?? false,
      instructor_id: course.instructor_id.startsWith(prefix)
        ? course.instructor_id
        : `${prefix}-${course.instructor_id}`,
      enrollment_count: 0,
      average_rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    setMockData('courses', [...(mockData['courses'] || []), ...courses])
    seededTables.add('courses')
  }

  // Seed enrollments
  if (data.enrollments && data.enrollments.length > 0) {
    const enrollments = data.enrollments.map((enrollment) => ({
      id: enrollment.id.startsWith(prefix) ? enrollment.id : `${prefix}-${enrollment.id}`,
      student_id: enrollment.student_id.startsWith(prefix)
        ? enrollment.student_id
        : `${prefix}-${enrollment.student_id}`,
      course_id: enrollment.course_id.startsWith(prefix)
        ? enrollment.course_id
        : `${prefix}-${enrollment.course_id}`,
      enrolled_at: new Date().toISOString(),
      completed_at: enrollment.completed_at ?? null,
      progress_percentage: enrollment.progress_percentage ?? 0,
      last_accessed_at: null,
    }))
    setMockData('enrollments', [...(mockData['enrollments'] || []), ...enrollments])
    seededTables.add('enrollments')
  }

  // Seed quests
  if (data.quests && data.quests.length > 0) {
    const quests = data.quests.map((quest) => ({
      id: quest.id.startsWith(prefix) ? quest.id : `${prefix}-${quest.id}`,
      course_id: quest.course_id.startsWith(prefix)
        ? quest.course_id
        : `${prefix}-${quest.course_id}`,
      title: quest.title,
      description: null,
      passing_score: quest.passing_score ?? 70,
      time_limit: null,
      max_attempts: quest.max_attempts ?? null,
      is_published: true,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    setMockData('quests', [...(mockData['quests'] || []), ...quests])
    seededTables.add('quests')
  }

  // Seed payments
  if (data.payments && data.payments.length > 0) {
    const payments = data.payments.map((payment) => ({
      id: payment.id.startsWith(prefix) ? payment.id : `${prefix}-${payment.id}`,
      student_id: payment.student_id.startsWith(prefix)
        ? payment.student_id
        : `${prefix}-${payment.student_id}`,
      course_id: payment.course_id.startsWith(prefix)
        ? payment.course_id
        : `${prefix}-${payment.course_id}`,
      amount: payment.amount,
      currency: 'USD',
      status: payment.status,
      stripe_payment_intent_id: null,
      stripe_session_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    setMockData('payments', [...(mockData['payments'] || []), ...payments])
    seededTables.add('payments')
  }

  // Seed badges
  if (data.badges && data.badges.length > 0) {
    const badges = data.badges.map((badge) => ({
      id: badge.id.startsWith(prefix) ? badge.id : `${prefix}-${badge.id}`,
      name: badge.name,
      description: null,
      icon_url: null,
      badge_tier: badge.badge_tier,
      requirement_type: badge.requirement_type,
      requirement_criteria: badge.requirement_criteria,
      points_reward: badge.points_reward ?? 0,
      created_at: new Date().toISOString(),
    }))
    setMockData('badges', [...(mockData['badges'] || []), ...badges])
    seededTables.add('badges')
  }

  // Seed skills
  if (data.skills && data.skills.length > 0) {
    const skills = data.skills.map((skill) => ({
      id: skill.id.startsWith(prefix) ? skill.id : `${prefix}-${skill.id}`,
      name: skill.name,
      description: null,
      category: skill.category,
      icon_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    setMockData('skills', [...(mockData['skills'] || []), ...skills])
    seededTables.add('skills')
  }
}

/**
 * Clean all test data from the database
 *
 * Removes all data that was seeded during the current test run.
 * Uses the test run ID prefix to identify and remove only test data.
 *
 * Implements Requirement 21.2 (cleanup after test run)
 *
 * @example
 * // In beforeEach hook to ensure clean state
 * beforeEach(async () => {
 *   await testDatabaseHelper.clean()
 * })
 */
async function clean(): Promise<void> {
  const prefix = currentTestRunId || 'test'

  // Clean each seeded table by filtering out test data
  seededTables.forEach((table) => {
    if (mockData[table]) {
      mockData[table] = mockData[table].filter(
        (item: { id?: string }) => !item.id?.startsWith(prefix)
      )
    }
  })

  // Also clean any data with generic test prefixes
  Object.keys(mockData).forEach((table) => {
    if (mockData[table]) {
      mockData[table] = mockData[table].filter(
        (item: { id?: string }) =>
          !item.id?.startsWith('test-') && !item.id?.startsWith(prefix)
      )
    }
  })
}

/**
 * Get the current test run ID
 *
 * Useful for creating test data with the correct prefix.
 *
 * @returns Current test run ID or null if not set up
 */
export function getTestRunId(): string | null {
  return currentTestRunId
}

/**
 * Create a prefixed ID for test data
 *
 * Ensures IDs are unique across parallel test runs.
 *
 * @param baseId - Base identifier
 * @returns Prefixed identifier
 *
 * @example
 * const userId = createTestId('user-1') // 'test-run-xxx-user-1'
 */
export function createTestId(baseId: string): string {
  const prefix = currentTestRunId || 'test'
  return `${prefix}-${baseId}`
}

/**
 * Test database helper object implementing TestDatabaseHelper interface
 *
 * Provides a consistent API for database test utilities.
 *
 * @example
 * import { testDatabaseHelper } from 'test-utils/helpers/db'
 *
 * describe('Integration tests', () => {
 *   beforeAll(() => testDatabaseHelper.setup())
 *   afterAll(() => testDatabaseHelper.teardown())
 *   beforeEach(() => testDatabaseHelper.clean())
 *
 *   it('should create enrollment', async () => {
 *     await testDatabaseHelper.seed({
 *       users: [{ id: 'student-1', ... }],
 *       courses: [{ id: 'course-1', ... }],
 *     })
 *     // Test enrollment logic
 *   })
 * })
 */
export const testDatabaseHelper: TestDatabaseHelper = {
  setup,
  teardown,
  seed,
  clean,
}

export default testDatabaseHelper
