/**
 * Test Helper Types
 *
 * Type definitions for test helper interfaces as specified in the design document.
 * These interfaces define the contracts for database, auth, and component render helpers.
 */

import type { RenderResult, RenderOptions as RTLRenderOptions } from '@testing-library/react'
import type { UserRole } from '@/types/database.types'

/**
 * Test data structure for seeding the database
 */
export interface TestData {
  users?: TestUserData[]
  courses?: TestCourseData[]
  enrollments?: TestEnrollmentData[]
  quests?: TestQuestData[]
  payments?: TestPaymentData[]
  badges?: TestBadgeData[]
  skills?: TestSkillData[]
}

/**
 * Test user data for seeding
 */
export interface TestUserData {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_approved?: boolean
  is_active?: boolean
}

/**
 * Test course data for seeding
 */
export interface TestCourseData {
  id: string
  title: string
  slug: string
  instructor_id: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  is_published?: boolean
  is_approved?: boolean
}

/**
 * Test enrollment data for seeding
 */
export interface TestEnrollmentData {
  id: string
  student_id: string
  course_id: string
  progress_percentage?: number
  completed_at?: string | null
}

/**
 * Test quest data for seeding
 */
export interface TestQuestData {
  id: string
  course_id: string
  title: string
  passing_score?: number
  max_attempts?: number | null
}

/**
 * Test payment data for seeding
 */
export interface TestPaymentData {
  id: string
  student_id: string
  course_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
}

/**
 * Test badge data for seeding
 */
export interface TestBadgeData {
  id: string
  name: string
  badge_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  requirement_type: string
  requirement_criteria: Record<string, unknown>
  points_reward?: number
}

/**
 * Test skill data for seeding
 */
export interface TestSkillData {
  id: string
  name: string
  category: 'web' | 'network' | 'cryptography' | 'social_engineering' | 'reverse_engineering' | 'forensics'
}

/**
 * Auth session returned by login helpers
 */
export interface AuthSession {
  user: {
    id: string
    email: string
    role: UserRole
  }
  accessToken: string
  refreshToken: string
}

/**
 * User type for render helpers
 */
export interface TestUser {
  id: string
  email: string
  full_name: string
  role: UserRole
}

/**
 * Extended render options for component testing
 */
export interface RenderOptions extends RTLRenderOptions {
  /** Initial route for router context */
  route?: string
  /** Search params for router context */
  searchParams?: Record<string, string>
  /** Route params for router context */
  params?: Record<string, string | string[]>
}

/**
 * Database helper interface for integration tests
 * Implements Requirements 21.2 (cleanup) and 21.5 (parallel isolation)
 */
export interface TestDatabaseHelper {
  /**
   * Set up the test database connection
   * Creates isolated test schema or transaction
   */
  setup(): Promise<void>

  /**
   * Tear down the test database
   * Cleans up all test data and closes connections
   */
  teardown(): Promise<void>

  /**
   * Seed the database with test data
   * @param data - Test data to insert
   */
  seed(data: TestData): Promise<void>

  /**
   * Clean all test data from the database
   * Removes data created during tests
   */
  clean(): Promise<void>
}

/**
 * Auth helper interface for E2E and integration tests
 */
export interface TestAuthHelper {
  /**
   * Login as a student user
   * @returns Auth session with tokens
   */
  loginAsStudent(): Promise<AuthSession>

  /**
   * Login as a mentor user
   * @returns Auth session with tokens
   */
  loginAsMentor(): Promise<AuthSession>

  /**
   * Login as an admin user
   * @returns Auth session with tokens
   */
  loginAsAdmin(): Promise<AuthSession>

  /**
   * Logout the current user
   */
  logout(): Promise<void>
}

/**
 * Component render helper interface
 */
export interface ComponentRenderHelper {
  /**
   * Render a component with standard test providers
   * @param component - React element to render
   * @param options - Render options
   * @returns Testing Library render result
   */
  render(component: React.ReactElement, options?: RenderOptions): RenderResult

  /**
   * Render a component with authenticated user context
   * @param component - React element to render
   * @param user - User to authenticate as
   * @returns Testing Library render result
   */
  renderWithAuth(component: React.ReactElement, user: TestUser): RenderResult
}
