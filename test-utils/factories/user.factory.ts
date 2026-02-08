/**
 * User Factory for Test Data Generation
 *
 * Provides factory functions for creating test user data with unique identifiers.
 * Implements Requirements 21.1 (factory functions) and 21.3 (unique identifiers).
 */

import type { UserRole } from '@/types/database.types'

/**
 * Test user type matching the profiles table structure
 */
export interface TestUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  bio: string | null
  is_approved: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Generates a unique ID using timestamp and random string
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueId = (): string => {
  return `test-user-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Generates a unique email using timestamp
 * Ensures no collisions across test runs (Requirement 21.3)
 */
const generateUniqueEmail = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
}

/**
 * User factory for creating test user data
 *
 * @example
 * // Create a basic user
 * const user = userFactory.create()
 *
 * // Create a user with custom properties
 * const customUser = userFactory.create({ full_name: 'John Doe' })
 *
 * // Create role-specific users
 * const student = userFactory.createStudent()
 * const mentor = userFactory.createMentor()
 * const admin = userFactory.createAdmin()
 */
export const userFactory = {
  /**
   * Creates a test user with default values and optional overrides
   * Default role is 'student'
   *
   * @param overrides - Partial user properties to override defaults
   * @returns A complete TestUser object
   */
  create: (overrides: Partial<TestUser> = {}): TestUser => {
    const now = new Date().toISOString()
    return {
      id: generateUniqueId(),
      email: generateUniqueEmail(),
      full_name: 'Test User',
      role: 'student' as const,
      avatar_url: null,
      bio: null,
      is_approved: true,
      is_active: true,
      created_at: now,
      updated_at: now,
      ...overrides,
    }
  },

  /**
   * Creates a test user with 'student' role
   *
   * @param overrides - Partial user properties to override defaults
   * @returns A TestUser object with role='student'
   */
  createStudent: (overrides: Partial<TestUser> = {}): TestUser => {
    return userFactory.create({ role: 'student', ...overrides })
  },

  /**
   * Creates a test user with 'mentor' role
   *
   * @param overrides - Partial user properties to override defaults
   * @returns A TestUser object with role='mentor'
   */
  createMentor: (overrides: Partial<TestUser> = {}): TestUser => {
    return userFactory.create({ role: 'mentor', ...overrides })
  },

  /**
   * Creates a test user with 'admin' role
   *
   * @param overrides - Partial user properties to override defaults
   * @returns A TestUser object with role='admin'
   */
  createAdmin: (overrides: Partial<TestUser> = {}): TestUser => {
    return userFactory.create({ role: 'admin', ...overrides })
  },
}
