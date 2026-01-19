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

export async function getUserProfile() {
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
