import '@testing-library/jest-dom/vitest'
import { vi, beforeEach, afterEach } from 'vitest'

// Import mock modules
import {
  redirect,
  permanentRedirect,
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  notFound,
  resetNavigationMocks,
} from '../../__mocks__/next-navigation'

import {
  cookies,
  headers,
  revalidatePath,
  revalidateTag,
} from '../../__mocks__/next-navigation'

import {
  resetMocks as resetSupabaseMocks,
} from '../../__mocks__/supabase'

import {
  resetStripeMocks,
} from '../../__mocks__/stripe'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect,
  permanentRedirect,
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  notFound,
}))

// Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies,
  headers,
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath,
  revalidateTag,
}))

// Mock Supabase clients
vi.mock('@/lib/supabase/server', () => import('../../__mocks__/supabase'))
vi.mock('@/lib/supabase/client', () => import('../../__mocks__/supabase'))
vi.mock('@/lib/supabase/admin', () => import('../../__mocks__/supabase'))

// Mock Stripe
vi.mock('stripe', () => import('../../__mocks__/stripe'))

// Configure fast-check for property-based testing
import * as fc from 'fast-check'
fc.configureGlobal({ numRuns: 100 })

// Global test utilities
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  // Reset all mock states between tests
  resetNavigationMocks()
  resetSupabaseMocks()
  resetStripeMocks()
})
