import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function resendVerification(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  })

  if (error) {
    redirect(`/resend-verification?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/resend-verification?success=Verification email sent! Check your inbox.`)
}

export default function ResendVerificationPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Resend Verification Email</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              ✅ {searchParams.success}
            </div>
          )}

          {searchParams?.error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              <strong>Error:</strong> {searchParams.error}
            </div>
          )}

          <form action={resendVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                defaultValue="cikumel@gmail.com"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Resend Verification Email
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
