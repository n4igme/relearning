import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated and is an admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Check if profile exists (admin only)
  const { data: targetProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, created_at')
    .eq('email', email)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Check auth user (admin only)
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    return NextResponse.json({ error: 'Auth error' }, { status: 500 })
  }

  const authUser = users?.find(u => u.email === email)

  return NextResponse.json({
    profile: targetProfile,
    authUser: authUser ? {
      id: authUser.id,
      email: authUser.email,
      confirmed_at: authUser.confirmed_at,
      email_confirmed_at: authUser.email_confirmed_at,
      created_at: authUser.created_at,
    } : null,
  })
}
