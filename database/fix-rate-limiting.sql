-- =====================================================
-- SECURITY FIX: Persistent rate limiting table
-- =====================================================
-- Replaces in-memory Map-based rate limiter that was ineffective
-- in serverless (Netlify) and multi-instance deployments.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_created ON public.rate_limits(key, created_at);

-- No RLS needed — accessed only via admin/service-role client
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access (used by admin client in rate-limit.ts)
-- No user-facing policies needed
