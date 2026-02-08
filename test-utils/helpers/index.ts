/**
 * Test Helpers Index
 *
 * Central export point for all test helper utilities.
 * Import from this file for convenient access to all helpers.
 *
 * @example
 * import {
 *   render,
 *   renderWithAuth,
 *   testDatabaseHelper,
 *   testAuthHelper,
 * } from 'test-utils/helpers'
 */

// Component render helpers
export {
  render,
  renderWithAuth,
  componentRenderHelper,
} from './render'

// Re-export Testing Library utilities
export * from '@testing-library/react'

// Database helpers
export {
  testDatabaseHelper,
  getTestRunId,
  createTestId,
} from './db'

// Auth helpers
export {
  testAuthHelper,
  loginWithUser,
  isAuthenticated,
  getCurrentUser,
} from './auth'

// Types
export type {
  TestData,
  TestUserData,
  TestCourseData,
  TestEnrollmentData,
  TestQuestData,
  TestPaymentData,
  TestBadgeData,
  TestSkillData,
  AuthSession,
  TestUser,
  RenderOptions,
  TestDatabaseHelper,
  TestAuthHelper,
  ComponentRenderHelper,
} from './types'
