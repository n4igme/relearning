import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionData.user) {
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

        await supabase.from('profiles').insert(profileData)

        // Redirect to pending approval page
        return NextResponse.redirect(`${origin}/login?message=Your account has been created and is pending approval. An admin will review your account shortly.`)
      }

      // If profile exists but is not a student, deny Google SSO access
      if (existingProfile.role !== 'student') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=Google sign-in is only available for students. Please use email and password to sign in.`)
      }

      // Check if user is approved
      if (!existingProfile.is_approved) {
        return NextResponse.redirect(`${origin}/login?error=Your account is pending approval. Please wait for an admin to approve your account.`)
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
