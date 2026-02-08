/**
 * Component Render Helper for Testing
 *
 * Provides utilities for rendering React components with necessary providers
 * and context for testing. Implements the ComponentRenderHelper interface.
 *
 * @example
 * // Basic render
 * const { getByText } = render(<MyComponent />)
 *
 * // Render with route context
 * const { getByText } = render(<MyComponent />, { route: '/courses/123' })
 *
 * // Render with authenticated user
 * const { getByText } = renderWithAuth(<MyComponent />, mockUser)
 */

import React, { type ReactElement } from 'react'
import { render as rtlRender, type RenderResult } from '@testing-library/react'
import {
  setMockPathname,
  setMockSearchParams,
  setMockParams,
} from '../../__mocks__/next-navigation'
import {
  setAuthResponse,
} from '../../__mocks__/supabase'
import type { RenderOptions, TestUser, ComponentRenderHelper } from './types'

/**
 * All Providers wrapper component
 *
 * Wraps children with all necessary providers for testing.
 * Currently minimal since the app doesn't use complex context providers,
 * but can be extended as needed.
 */
interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps): ReactElement {
  // Add any global providers here as the app grows
  // e.g., ThemeProvider, QueryClientProvider, etc.
  return <>{children}</>
}

/**
 * Configure navigation mocks based on render options
 *
 * @param options - Render options containing route configuration
 */
function configureNavigationMocks(options?: RenderOptions): void {
  if (options?.route) {
    setMockPathname(options.route)
  }

  if (options?.searchParams) {
    setMockSearchParams(options.searchParams)
  }

  if (options?.params) {
    setMockParams(options.params)
  }
}

/**
 * Configure auth mocks for authenticated user
 *
 * @param user - User to authenticate as
 */
function configureAuthMocks(user: TestUser): void {
  setAuthResponse('getUser', {
    data: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      },
    },
    error: null,
  })
}

/**
 * Custom render function that wraps components with test providers
 *
 * This function extends React Testing Library's render with:
 * - All necessary context providers
 * - Navigation mock configuration
 * - Consistent wrapper for all tests
 *
 * @param ui - React element to render
 * @param options - Render options including route configuration
 * @returns Testing Library render result with all queries
 *
 * @example
 * // Basic usage
 * const { getByText, getByRole } = render(<Button>Click me</Button>)
 *
 * // With route context
 * const { getByText } = render(<CourseDetail />, {
 *   route: '/courses/123',
 *   params: { id: '123' }
 * })
 *
 * // With search params
 * const { getByText } = render(<SearchResults />, {
 *   route: '/search',
 *   searchParams: { q: 'cybersecurity' }
 * })
 */
export function render(
  ui: ReactElement,
  options?: RenderOptions
): RenderResult {
  // Configure navigation mocks based on options
  configureNavigationMocks(options)

  // Extract wrapper from options or use default
  const { wrapper: CustomWrapper, ...renderOptions } = options || {}

  // Create wrapper that combines custom wrapper with providers
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const content = <AllProviders>{children}</AllProviders>
    return CustomWrapper ? <CustomWrapper>{content}</CustomWrapper> : content
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Render a component with authenticated user context
 *
 * This function sets up auth mocks to simulate an authenticated user,
 * then renders the component with all providers.
 *
 * @param ui - React element to render
 * @param user - User to authenticate as
 * @param options - Additional render options
 * @returns Testing Library render result
 *
 * @example
 * import { userFactory } from '../factories/user.factory'
 *
 * const student = userFactory.createStudent()
 * const { getByText } = renderWithAuth(<Dashboard />, student)
 *
 * // With route context
 * const mentor = userFactory.createMentor()
 * const { getByText } = renderWithAuth(<CourseEditor />, mentor, {
 *   route: '/mentor/courses/123',
 *   params: { id: '123' }
 * })
 */
export function renderWithAuth(
  ui: ReactElement,
  user: TestUser,
  options?: RenderOptions
): RenderResult {
  // Configure auth mocks for the user
  configureAuthMocks(user)

  // Render with standard providers
  return render(ui, options)
}

/**
 * Component render helper object implementing ComponentRenderHelper interface
 *
 * Provides a consistent API for component testing utilities.
 *
 * @example
 * import { componentRenderHelper } from 'test-utils/helpers/render'
 *
 * const { render, renderWithAuth } = componentRenderHelper
 * const result = render(<MyComponent />)
 */
export const componentRenderHelper: ComponentRenderHelper = {
  render,
  renderWithAuth,
}

/**
 * Re-export everything from @testing-library/react for convenience
 * This allows tests to import everything from this file
 */
export * from '@testing-library/react'

// Note: @testing-library/user-event can be installed separately if needed
// for interaction testing. Install with: npm install -D @testing-library/user-event
