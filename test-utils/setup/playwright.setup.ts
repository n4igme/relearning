import { test as base, expect } from '@playwright/test'

// Define custom fixtures for E2E tests
interface TestFixtures {
  authenticatedPage: ReturnType<typeof base.extend>
}

// Export extended test with custom fixtures
export const test = base.extend<TestFixtures>({
  // Add custom fixtures here as needed
})

// Re-export expect for convenience
export { expect }

// Global setup for E2E tests
export async function globalSetup() {
  // Add any global setup logic here
  // e.g., seeding test database, creating test users
  console.log('Running global E2E setup...')
}

// Global teardown for E2E tests
export async function globalTeardown() {
  // Add any global teardown logic here
  // e.g., cleaning up test data
  console.log('Running global E2E teardown...')
}
