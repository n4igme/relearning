'use server'

/**
 * Persistent rate limiter using Supabase.
 * Works across serverless invocations and multiple instances.
 *
 * Requires the rate_limits table (see database/fix-rate-limiting.sql).
 * Falls back to in-memory if Supabase is unavailable.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function checkRateLimit(
  key: string,
  { maxRequests = 10, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMs)

    // Delete expired entries for this key
    await supabase
      .from('rate_limits')
      .delete()
      .eq('key', key)
      .lt('expires_at', now.toISOString())

    // Count requests in current window
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart.toISOString())

    const currentCount = count || 0

    if (currentCount >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    // Insert new entry
    await supabase.from('rate_limits').insert({
      key,
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + windowMs).toISOString(),
    })

    return { allowed: true, remaining: maxRequests - currentCount - 1 }
  } catch (error) {
    // Fail closed for authentication-critical paths
    if (key.startsWith('login:') || key.startsWith('signup:') || key.startsWith('reset:')) {
      console.error('Rate limiter failed on critical path — blocking request', error)
      return { allowed: false, remaining: 0 }
    }
    // Fail open for less critical paths to preserve availability
    return { allowed: true, remaining: 0 }
  }
}
