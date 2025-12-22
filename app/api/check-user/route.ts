import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  // Check auth user
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  const authUser = users?.find(u => u.email === email)

  return NextResponse.json({
    profile,
    profileError,
    authUser: authUser ? {
      id: authUser.id,
      email: authUser.email,
      confirmed_at: authUser.confirmed_at,
      email_confirmed_at: authUser.email_confirmed_at,
      created_at: authUser.created_at,
    } : null,
    usersError,
  })
}
