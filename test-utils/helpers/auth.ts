/**
 * Authentication Test Helper
 *
 * Provides utilities for simulating authentication in tests.
 * Implements the TestAuthHelper interface for consistent auth testing.
 *
 * For unit tests, this helper configures the Supabase auth mocks.
 * For E2E tests, this helper can be extended to perform actual login flows.
 *
 * @example
 * // In a unit test
 * import { testAuthHelper } from 'test-utils/helpers/auth'
 *
 * it('should show dashboard for authenticated student', async () => {
 *   const session = await testAuthHelper.loginAsStudent()
 *   // session.user contains the authenticated user
 *   // Supabase mocks are configured to return this user
 * })
 */

import {
  setAuthResponse,
} from '../../__mocks__/supabase'
import {
  setMockCookie,
  mockCookies,
} from '../../__mocks__/next-navigation'
import { testUsers } from '../fixtures/test-data'
import type { AuthSession, TestAuthHelper } from './types'

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Generate mock tokens for a session
 */
function generateTokens(): { accessToken: string; refreshToken: string } {
  const sessionId = generateSessionId()
  return {
    accessToken: `mock-access-token-${sessionId}`,
    refreshToken: `mock-refresh-token-${sessionId}`,
  }
}

/**
 * Configure auth mocks for a logged-in user
 *
 * Sets up Supabase auth mocks and cookies to simulate an authenticated session.
 *
 * @param user - User data to authenticate as
 * @param tokens - Session tokens
 */
function configureAuthenticatedSession(
  user: { id: string; email: string; full_name: string; role: string },
  tokens: { accessToken: string; refreshToken: string }
): void {
  // Configure Supabase getUser to return the authenticated user
  setAuthResponse('getUser', {
    data: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    },
    error: null,
  })

  // Configure Supabase signInWithPassword to succeed
  setAuthResponse('signInWithPassword', {
    data: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      },
      session: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: 3600,
        token_type: 'bearer',
      },
    },
    error: null,
  })

  // Set auth cookies for middleware checks
  setMockCookie('sb-access-token', tokens.accessToken)
  setMockCookie('sb-refresh-token', tokens.refreshToken)
}

/**
 * Clear auth mocks and cookies
 *
 * Resets the auth state to simulate a logged-out user.
 */
function clearAuthenticatedSession(): void {
  // Configure Supabase getUser to return no user
  setAuthResponse('getUser', {
    data: { user: null },
    error: null,
  })

  // Configure Supabase signOut to succeed
  setAuthResponse('signOut', {
    error: null,
  })

  // Clear mock cookies (if the mock supports it)
  if (mockCookies && typeof mockCookies.clear === 'function') {
    mockCookies.clear()
  }
}

/**
 * Login as a student user
 *
 * Configures auth mocks to simulate an authenticated student session.
 *
 * @returns Auth session with user data and tokens
 *
 * @example
 * const session = await testAuthHelper.loginAsStudent()
 * expect(session.user.role).toBe('student')
 */
async function loginAsStudent(): Promise<AuthSession> {
  const user = {
    id: `test-student-${Date.now()}`,
    email: testUsers.student.email,
    full_name: testUsers.student.full_name,
    role: testUsers.student.role,
  }

  const tokens = generateTokens()
  configureAuthenticatedSession(user, tokens)

  return {
    user: {
      id: user.id,
      email: user.email,
      role: 'student',
    },
    ...tokens,
  }
}

/**
 * Login as a mentor user
 *
 * Configures auth mocks to simulate an authenticated mentor session.
 *
 * @returns Auth session with user data and tokens
 *
 * @example
 * const session = await testAuthHelper.loginAsMentor()
 * expect(session.user.role).toBe('mentor')
 */
async function loginAsMentor(): Promise<AuthSession> {
  const user = {
    id: `test-mentor-${Date.now()}`,
    email: testUsers.mentor.email,
    full_name: testUsers.mentor.full_name,
    role: testUsers.mentor.role,
  }

  const tokens = generateTokens()
  configureAuthenticatedSession(user, tokens)

  return {
    user: {
      id: user.id,
      email: user.email,
      role: 'mentor',
    },
    ...tokens,
  }
}

/**
 * Login as an admin user
 *
 * Configures auth mocks to simulate an authenticated admin session.
 *
 * @returns Auth session with user data and tokens
 *
 * @example
 * const session = await testAuthHelper.loginAsAdmin()
 * expect(session.user.role).toBe('admin')
 */
async function loginAsAdmin(): Promise<AuthSession> {
  const user = {
    id: `test-admin-${Date.now()}`,
    email: testUsers.admin.email,
    full_name: testUsers.admin.full_name,
    role: testUsers.admin.role,
  }

  const tokens = generateTokens()
  configureAuthenticatedSession(user, tokens)

  return {
    user: {
      id: user.id,
      email: user.email,
      role: 'admin',
    },
    ...tokens,
  }
}

/**
 * Logout the current user
 *
 * Clears auth mocks and cookies to simulate a logged-out state.
 *
 * @example
 * await testAuthHelper.loginAsStudent()
 * // ... perform authenticated actions
 * await testAuthHelper.logout()
 * // User is now logged out
 */
async function logout(): Promise<void> {
  clearAuthenticatedSession()
}

/**
 * Login with custom user data
 *
 * Allows tests to authenticate with specific user properties.
 *
 * @param userData - Custom user data
 * @returns Auth session with user data and tokens
 *
 * @example
 * const session = await loginWithUser({
 *   id: 'custom-user-id',
 *   email: 'custom@example.com',
 *   full_name: 'Custom User',
 *   role: 'student',
 * })
 */
export async function loginWithUser(userData: {
  id: string
  email: string
  full_name: string
  role: 'student' | 'mentor' | 'admin'
}): Promise<AuthSession> {
  const tokens = generateTokens()
  configureAuthenticatedSession(userData, tokens)

  return {
    user: {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    ...tokens,
  }
}

/**
 * Check if a user is currently authenticated
 *
 * Useful for assertions in tests.
 *
 * @returns True if auth mocks are configured for an authenticated user
 */
export function isAuthenticated(): boolean {
  // This is a simplified check - in real implementation,
  // you might check the mock state more thoroughly
  return true // Placeholder - actual implementation depends on mock state
}

/**
 * Get the current authenticated user from mocks
 *
 * @returns Current user data or null if not authenticated
 */
export function getCurrentUser(): { id: string; email: string; role: string } | null {
  // This would need to read from the mock state
  // For now, return null as a placeholder
  return null
}

/**
 * Test auth helper object implementing TestAuthHelper interface
 *
 * Provides a consistent API for authentication test utilities.
 *
 * @example
 * import { testAuthHelper } from 'test-utils/helpers/auth'
 *
 * describe('Protected routes', () => {
 *   afterEach(async () => {
 *     await testAuthHelper.logout()
 *   })
 *
 *   it('should allow student access to dashboard', async () => {
 *     await testAuthHelper.loginAsStudent()
 *     // Test dashboard access
 *   })
 *
 *   it('should allow admin access to admin panel', async () => {
 *     await testAuthHelper.loginAsAdmin()
 *     // Test admin panel access
 *   })
 * })
 */
export const testAuthHelper: TestAuthHelper = {
  loginAsStudent,
  loginAsMentor,
  loginAsAdmin,
  logout,
}

export default testAuthHelper
