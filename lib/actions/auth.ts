'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  // Validate and extract form data
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()
  const full_name = formData.get('full_name')?.toString().trim()
  const role = formData.get('role')?.toString() || 'student'

  // Input validation
  if (!email || !password || !full_name) {
    return { error: 'All fields are required' }
  }

  // Rate limiting: 3 signups per IP-like key per hour
  const { checkRateLimit } = await import('@/lib/rate-limit')
  const { allowed } = await checkRateLimit(`signup:${email}`, { maxRequests: 3, windowMs: 3600_000 })
  if (!allowed) {
    return { error: 'Too many registration attempts. Please try again later.' }
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email format' }
  }

  // Password strength validation
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' }
  }

  // Role validation
  const validRoles = ['student', 'mentor']
  if (!validRoles.includes(role)) {
    return { error: 'Invalid role' }
  }

  const data = {
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: 'Failed to create account. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  // Validate and extract form data
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  // Input validation
  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  // Rate limiting: 5 attempts per email per minute
  const { checkRateLimit } = await import('@/lib/rate-limit')
  const { allowed } = await checkRateLimit(`login:${email}`, { maxRequests: 5, windowMs: 60_000 })
  if (!allowed) {
    redirect('/login?error=' + encodeURIComponent('Too many login attempts. Please wait a minute.'))
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect('/login?error=' + encodeURIComponent('Invalid email format'))
  }

  const data = {
    email,
    password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Redirect to login with generic error message
    redirect(`/login?error=${encodeURIComponent('Invalid email or password')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(): Promise<{
  id: string
  email: string
  full_name: string
  role: string
  avatar_url: string | null
  bio: string | null
  is_approved: boolean
  is_active: boolean
  created_at: string
  updated_at: string
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email')?.toString().trim()

  if (!email) {
    redirect('/forgot-password?error=' + encodeURIComponent('Email is required'))
  }

  // Rate limiting: 3 reset requests per email per hour
  const { checkRateLimit } = await import('@/lib/rate-limit')
  const { allowed } = await checkRateLimit(`reset:${email}`, { maxRequests: 3, windowMs: 3600_000 })
  if (!allowed) {
    redirect('/forgot-password?error=' + encodeURIComponent('Too many reset requests. Please try again later.'))
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    redirect('/forgot-password?error=' + encodeURIComponent('Failed to send reset email. Please try again.'))
  }

  redirect('/forgot-password?success=' + encodeURIComponent('Check your email for a password reset link.'))
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()

  if (!password || !confirmPassword) {
    redirect('/reset-password?error=' + encodeURIComponent('All fields are required'))
  }

  if (password !== confirmPassword) {
    redirect('/reset-password?error=' + encodeURIComponent('Passwords do not match'))
  }

  if (password.length < 8) {
    redirect('/reset-password?error=' + encodeURIComponent('Password must be at least 8 characters'))
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent('Failed to update password. Please try again.'))
  }

  redirect('/login?message=' + encodeURIComponent('Password updated successfully. Please sign in.'))
}
