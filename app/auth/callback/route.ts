import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // Log for debugging
  console.log('[Auth Callback] Origin:', origin)
  console.log('[Auth Callback] Has code:', !!code)

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('[Auth Callback] Error exchanging code for session:', sessionError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed: ' + sessionError.message)}`)
    }

    if (!sessionData?.user) {
      console.error('[Auth Callback] No user data returned from session exchange')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to authenticate. Please try again.')}`)
    }

    if (sessionData?.user) {
      // Check if user has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single()

      // If no profile exists, create one with student role (Google SSO is for students only)
      if (!existingProfile) {
        const profileData: Database['public']['Tables']['profiles']['Insert'] = {
          id: sessionData.user.id,
          email: sessionData.user.email!,
          full_name: sessionData.user.user_metadata.full_name ||
                     sessionData.user.user_metadata.name ||
                     sessionData.user.email?.split('@')[0] ||
                     'Student User',
          role: 'student',
          avatar_url: sessionData.user.user_metadata.avatar_url ||
                      sessionData.user.user_metadata.picture || null,
          is_approved: false, // Students need admin approval
          is_active: true,
        }

        const { error: insertError } = await supabase.from('profiles').insert(profileData)

        if (insertError) {
          console.error('Error creating profile:', insertError)
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to create profile: ' + insertError.message)}`)
        }

        // Redirect to pending approval page
        return NextResponse.redirect(`${origin}/login?message=Your account has been created and is pending approval. An admin will review your account shortly.`)
      }

      // Check if this is a Google OAuth login (not email confirmation)
      const provider = sessionData.user.app_metadata.provider
      const isGoogleOAuth = provider === 'google'
      const isEmailProvider = provider === 'email'

      console.log('[Auth Callback] Provider:', provider)
      console.log('[Auth Callback] User role:', existingProfile.role)
      console.log('[Auth Callback] Is approved:', existingProfile.is_approved)
      console.log('[Auth Callback] Is email provider:', isEmailProvider)

      // If profile exists but is not a student, deny Google SSO access
      // This restriction only applies to Google OAuth, not email signups
      if (isGoogleOAuth && existingProfile.role !== 'student') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=Google sign-in is only available for students. Please use email and password to sign in.`)
      }

      // Auto-approve students after email confirmation OR Google SSO
      if (existingProfile.role === 'student' && !existingProfile.is_approved) {
        // Students are auto-approved for both email confirmation and Google SSO
        if (isEmailProvider || isGoogleOAuth) {
          console.log('[Auth Callback] Attempting to auto-approve student...')

          try {
            // Use admin client to bypass RLS
            const adminClient = createAdminClient()
            const { error: approveError } = await adminClient
              .from('profiles')
              .update({ is_approved: true })
              .eq('id', sessionData.user.id)

            if (approveError) {
              console.error('[Auth Callback] Error approving student:', approveError)
              return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to auto-approve account: ' + approveError.message)}`)
            } else {
              console.log('[Auth Callback] Student auto-approved successfully!')
              // Update the existingProfile object so the check below passes
              existingProfile.is_approved = true
            }
          } catch (err) {
            console.error('[Auth Callback] Exception during auto-approval:', err)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Failed to auto-approve account. Please contact support.')}`)
          }
        }
      }

      // Check if user is approved (mentors need admin approval)
      if (existingProfile.role === 'mentor' && !existingProfile.is_approved) {
        return NextResponse.redirect(`${origin}/login?error=Your account is pending approval. Please wait for an admin to approve your account.`)
      }

      // Check if student is not approved (shouldn't happen after auto-approval above, but safeguard)
      if (existingProfile.role === 'student' && !existingProfile.is_approved) {
        return NextResponse.redirect(`${origin}/login?error=Please confirm your email address to activate your account.`)
      }

      // Check if user is active
      if (!existingProfile.is_active) {
        return NextResponse.redirect(`${origin}/login?error=Your account has been deactivated. Please contact an administrator.`)
      }
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${origin}/dashboard`)
}
